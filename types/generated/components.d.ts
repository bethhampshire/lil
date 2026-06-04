import type { Schema, Struct } from '@strapi/strapi';

export interface ContactContactPanel extends Struct.ComponentSchema {
  collectionName: 'components_contact_contact_panels';
  info: {
    displayName: 'Contact panel';
    icon: 'envelop';
  };
  attributes: {
    Description: Schema.Attribute.RichText & Schema.Attribute.Required;
    IsAvailable: Schema.Attribute.Boolean &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<true>;
    Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Contact me'>;
  };
}

export interface InfoHero extends Struct.ComponentSchema {
  collectionName: 'components_info_heroes';
  info: {
    displayName: 'Hero';
    icon: 'star';
  };
  attributes: {
    Description: Schema.Attribute.Text & Schema.Attribute.Required;
    Image: Schema.Attribute.Media<'images' | 'files'> &
      Schema.Attribute.Required;
    Title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Lily Hawkes'>;
    TitleAccessory: Schema.Attribute.String & Schema.Attribute.DefaultTo<'BSc'>;
  };
}

export interface InfoTextBlock extends Struct.ComponentSchema {
  collectionName: 'components_info_text_blocks';
  info: {
    displayName: 'Text block';
    icon: 'filter';
  };
  attributes: {
    Text: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'contact.contact-panel': ContactContactPanel;
      'info.hero': InfoHero;
      'info.text-block': InfoTextBlock;
    }
  }
}
