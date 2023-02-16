// the "Stoat-" prefix is to prevent name clashing
export enum StoatPlugin {
  // task-based plugins
  StaticHosting = 'static_hosting',
  Json = 'json',
  ImageDiff = 'image_diff',
  Metric = 'metric',
  Chart = 'chart',
  WorkflowDispatch = 'workflow_dispatch',

  // global plugins
  JobRuntime = 'job_runtime'
}
