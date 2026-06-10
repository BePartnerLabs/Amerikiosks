import {
  FolderTypeField as FolderTypeField_2b8867833a34864a02ddf429b0728a40,
  SlugField as SlugField_2b8867833a34864a02ddf429b0728a40,
} from '@payloadcms/next/client'
import {
  CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
  FolderField as FolderField_f9c02e79a4aed9a3924487c0cd4cafb1,
  FolderTableCell as FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1,
} from '@payloadcms/next/rsc'
import {
  CollectionField as CollectionField_cdf7e044479f899a31f804427d568b36,
  ExportPreview as ExportPreview_cdf7e044479f899a31f804427d568b36,
  ExportSaveButton as ExportSaveButton_cdf7e044479f899a31f804427d568b36,
  FieldsToExport as FieldsToExport_cdf7e044479f899a31f804427d568b36,
  FormatField as FormatField_cdf7e044479f899a31f804427d568b36,
  ImportExportProvider as ImportExportProvider_cdf7e044479f899a31f804427d568b36,
  ImportPreview as ImportPreview_cdf7e044479f899a31f804427d568b36,
  ImportSaveButton as ImportSaveButton_cdf7e044479f899a31f804427d568b36,
  LimitField as LimitField_cdf7e044479f899a31f804427d568b36,
  LocaleField as LocaleField_cdf7e044479f899a31f804427d568b36,
  Page as Page_cdf7e044479f899a31f804427d568b36,
  SelectionToUseField as SelectionToUseField_cdf7e044479f899a31f804427d568b36,
  SortBy as SortBy_cdf7e044479f899a31f804427d568b36,
  SortOrder as SortOrder_cdf7e044479f899a31f804427d568b36,
} from '@payloadcms/plugin-import-export/rsc'
import {
  LinkToDoc as LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  ReindexButton as ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
} from '@payloadcms/plugin-search/client'
import {
  MetaDescriptionComponent as MetaDescriptionComponent_a8a977ebc872c5d5ea7ee689724c0860,
  MetaImageComponent as MetaImageComponent_a8a977ebc872c5d5ea7ee689724c0860,
  MetaTitleComponent as MetaTitleComponent_a8a977ebc872c5d5ea7ee689724c0860,
  OverviewComponent as OverviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  PreviewComponent as PreviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
} from '@payloadcms/plugin-seo/client'
import {
  BlocksFeatureClient as BlocksFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  BoldFeatureClient as BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  FixedToolbarFeatureClient as FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HeadingFeatureClient as HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  HorizontalRuleFeatureClient as HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  InlineToolbarFeatureClient as InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ItalicFeatureClient as ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  LinkFeatureClient as LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  ParagraphFeatureClient as ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  UnderlineFeatureClient as UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
} from '@payloadcms/richtext-lexical/client'
import {
  LexicalDiffComponent as LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalCell as RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  RscEntryLexicalField as RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
} from '@payloadcms/richtext-lexical/rsc'
import { VercelBlobClientUploadHandler as VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e } from '@payloadcms/storage-vercel-blob/client'
import { default as default_aa0a2d19d38a4839dbd373417e210b89 } from '@/components/AdminLogo'
import { default as default_1a7510af427896d367a49dbf838d2de6 } from '@/components/BeforeDashboard'
import { default as default_8a7ab0eb7ab5c511aba12e68480bfe5e } from '@/components/BeforeLogin'
import { MaterialIconPicker as MaterialIconPicker_332817f447aef6af0f19f42940f0f0c1 } from '@/components/MaterialIconPicker'
import { default as default_5310c2c4eff34b8acb55c69202ff8c5b } from '@/components/SeedPanel'
import { RowLabel as RowLabel_1f6ff6ff633e3695d348f4f3c58f1466 } from '@/Footer/RowLabel'
import { RowLabel as RowLabel_ec255a65fa6fa8d1faeb09cf35284224 } from '@/Header/RowLabel'

/** @type import('payload').ImportMap */
export const importMap = {
  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalCell':
    RscEntryLexicalCell_44fe37237e0ebf4470c9990d8cb7b07e,
  '@payloadcms/richtext-lexical/rsc#RscEntryLexicalField':
    RscEntryLexicalField_44fe37237e0ebf4470c9990d8cb7b07e,
  '@payloadcms/richtext-lexical/rsc#LexicalDiffComponent':
    LexicalDiffComponent_44fe37237e0ebf4470c9990d8cb7b07e,
  '@payloadcms/richtext-lexical/client#InlineToolbarFeatureClient':
    InlineToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#FixedToolbarFeatureClient':
    FixedToolbarFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#HeadingFeatureClient':
    HeadingFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#ParagraphFeatureClient':
    ParagraphFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#UnderlineFeatureClient':
    UnderlineFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#BoldFeatureClient':
    BoldFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#ItalicFeatureClient':
    ItalicFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#LinkFeatureClient':
    LinkFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/plugin-seo/client#OverviewComponent':
    OverviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#MetaTitleComponent':
    MetaTitleComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#MetaImageComponent':
    MetaImageComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#MetaDescriptionComponent':
    MetaDescriptionComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/plugin-seo/client#PreviewComponent':
    PreviewComponent_a8a977ebc872c5d5ea7ee689724c0860,
  '@payloadcms/next/client#SlugField': SlugField_2b8867833a34864a02ddf429b0728a40,
  '@payloadcms/richtext-lexical/client#HorizontalRuleFeatureClient':
    HorizontalRuleFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/richtext-lexical/client#BlocksFeatureClient':
    BlocksFeatureClient_e70f5e05f09f93e00b997edb1ef0c864,
  '@payloadcms/next/rsc#FolderTableCell': FolderTableCell_f9c02e79a4aed9a3924487c0cd4cafb1,
  '@payloadcms/next/rsc#FolderField': FolderField_f9c02e79a4aed9a3924487c0cd4cafb1,
  '@payloadcms/plugin-import-export/rsc#FormatField': FormatField_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#LimitField': LimitField_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#Page': Page_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#SortBy': SortBy_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#SortOrder': SortOrder_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#LocaleField': LocaleField_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#SelectionToUseField':
    SelectionToUseField_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#FieldsToExport':
    FieldsToExport_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#CollectionField':
    CollectionField_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#ExportPreview':
    ExportPreview_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#ExportSaveButton':
    ExportSaveButton_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#ImportPreview':
    ImportPreview_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-import-export/rsc#ImportSaveButton':
    ImportSaveButton_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/plugin-search/client#LinkToDoc': LinkToDoc_aead06e4cbf6b2620c5c51c9ab283634,
  '@payloadcms/plugin-search/client#ReindexButton': ReindexButton_aead06e4cbf6b2620c5c51c9ab283634,
  '@payloadcms/next/client#FolderTypeField': FolderTypeField_2b8867833a34864a02ddf429b0728a40,
  '@/components/MaterialIconPicker#MaterialIconPicker':
    MaterialIconPicker_332817f447aef6af0f19f42940f0f0c1,
  '@/Header/RowLabel#RowLabel': RowLabel_ec255a65fa6fa8d1faeb09cf35284224,
  '@/Footer/RowLabel#RowLabel': RowLabel_1f6ff6ff633e3695d348f4f3c58f1466,
  '@/components/AdminLogo#default': default_aa0a2d19d38a4839dbd373417e210b89,
  '@/components/SeedPanel#default': default_5310c2c4eff34b8acb55c69202ff8c5b,
  '@/components/BeforeDashboard#default': default_1a7510af427896d367a49dbf838d2de6,
  '@/components/BeforeLogin#default': default_8a7ab0eb7ab5c511aba12e68480bfe5e,
  '@payloadcms/plugin-import-export/rsc#ImportExportProvider':
    ImportExportProvider_cdf7e044479f899a31f804427d568b36,
  '@payloadcms/storage-vercel-blob/client#VercelBlobClientUploadHandler':
    VercelBlobClientUploadHandler_16c82c5e25f430251a3e3ba57219ff4e,
  '@payloadcms/next/rsc#CollectionCards': CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1,
}
