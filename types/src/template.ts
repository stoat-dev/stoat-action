export enum StoatTemplateFormat {
  Handlebars = 'hbs',
  Jinja2 = 'jinja2'
}

// the "Stoat-" prefix is to prevent name clashing
export interface StoatTemplate {
  format: StoatTemplateFormat;
  template: string;
}
