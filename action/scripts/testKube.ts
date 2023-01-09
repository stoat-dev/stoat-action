import {V1PodList} from "@kubernetes/client-node/dist/gen/model/v1PodList";
import http from "http";
import {V1Container, V1Pod} from "@kubernetes/client-node";
import * as fs from 'fs';
import * as path from 'path';
const k8s = require('@kubernetes/client-node');

interface KubeLoggable {
    namespace: string;
    pod: string;
    container: string;
}

type File = {
    name: string;
    type: 'file';
}

type Directory = {
    name: string;
    type: 'directory';
    children: Array<File | Directory>;
}

type FileTree = Directory;

function convertToFileTree(loggables: KubeLoggable[]): FileTree {
    const namespaces = new Set(loggables.map(l => l.namespace));
    const namespaceNodes = Array.from(namespaces).map(ns => ({
        name: ns,
        type: 'directory',
        children: []
    } as Directory));

    for (const loggable of loggables) {
        const namespaceNode = namespaceNodes.find(n => n.name === loggable.namespace);
        if (!namespaceNode) {
            continue;
        }
        const podNode = namespaceNode.children.find(n => n.name === loggable.pod);
        if (!podNode) {
            namespaceNode.children.push({
                name: loggable.pod,
                type: 'directory',
                children: []
            } as Directory);
        }
        (namespaceNode.children.find(n => n.name === loggable.pod)! as Directory)
            .children
            .push({
            name: `${loggable.container}.log`,
            type: 'file'
        });
    }

    return {
        name: '/',
        type: 'directory',
        children: namespaceNodes
    };
}


(async () => {
    const namespaces = ["default", "kube-system"];

    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();
    const kube = kc.makeApiClient(k8s.CoreV1Api);

    const loggables : KubeLoggable[] = [];

    for (const namespace of namespaces) {
        await kube.listNamespacedPod(namespace)
            .then((res: { response: http.IncomingMessage; body: V1PodList; }) => {
                res.body.items.forEach((pod: V1Pod) => {
                    pod.spec?.containers.forEach((container: V1Container) => {
                        loggables.push({
                            namespace: pod.metadata?.namespace!,
                            pod: pod.metadata?.name!,
                            container: container.name
                        })
                    });
                });
            });
    }

    const rootLogDir = "logs";

    await Promise.all(
        loggables.map(async loggable => {
            const logDir = path.join(rootLogDir, loggable.namespace, loggable.pod);
            const logFile = path.join(logDir, loggable.container + ".log");
            fs.mkdirSync(logDir, { recursive: true });

            const fileStream = fs.createWriteStream(logFile);

            fileStream.on('error', (error: Error) => {
                console.error(error);
                process.exit(1);
            });

            fileStream.on('drain', (error: Error) => {
                fileStream.end();
            });

            const log = new k8s.Log(kc);
            const logOptions = {follow: false, previous: true, pretty: false, timestamps: true};
            await log.log(loggable.namespace, loggable.pod, loggable.container, fileStream, logOptions)
                .catch((error:any) => {
                    console.log(error);
                    process.exit(1);
                });
        })
    );

    const logsListingPath = path.join(rootLogDir, "filetree.json");
    fs.writeFileSync(logsListingPath, JSON.stringify(convertToFileTree(loggables)));

})();

export {}
