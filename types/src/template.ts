export enum TemplateFormat {
  Handlebars = 'hbs',
  Jinja2 = 'jinja2'
}

export interface Template {
  format: TemplateFormat;
  template: string;
}
