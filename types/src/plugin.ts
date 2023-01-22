export enum Plugin {
  StaticHosting = 'static_hosting',
  Json = 'json',
  ImageDiff = 'image_diff',
  JobRuntime = 'job_runtime',
  WorkflowDispatch = 'workflow_dispatch'
}

export enum TemplateFormat {
  Handlebars = 'hbs',
  Jinja2 = 'jinja2'
}

export interface Template {
  format: TemplateFormat;
  template: string;
}
