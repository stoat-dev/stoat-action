export enum StoatTemplateFormat {
  Handlebars = 'hbs',
  Jinja2 = 'jinja2',
  JavaScript = 'js'
}

// the "Stoat-" prefix is to prevent name clashing
export interface StoatTemplate {
  format: StoatTemplateFormat;
  template: string;
}
