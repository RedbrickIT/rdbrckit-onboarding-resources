import type { Schema, Struct } from '@strapi/strapi';

export interface ResourceGroup extends Struct.ComponentSchema {
  collectionName: 'components_resource_groups';
  info: {
    description: 'A labelled set of links, e.g. "Wallpapers". The label renders in small caps above the buttons.';
    displayName: 'Group';
    icon: 'bulletList';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    links: Schema.Attribute.Component<'resource.link', true>;
    note: Schema.Attribute.Text;
  };
}

export interface ResourceLink extends Struct.ComponentSchema {
  collectionName: 'components_resource_links';
  info: {
    description: 'One dark pill on the page. Attach a file to serve a download, or set a URL to link out.';
    displayName: 'Link';
    icon: 'link';
  };
  attributes: {
    file: Schema.Attribute.Media<'images' | 'files'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'resource.group': ResourceGroup;
      'resource.link': ResourceLink;
    }
  }
}
