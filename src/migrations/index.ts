import * as migration_20260611_030447 from './20260611_030447';
import * as migration_20260611_164448 from './20260611_164448';
import * as migration_20260611_164757 from './20260611_164757';
import * as migration_20260611_171403 from './20260611_171403';
import * as migration_20260611_215117 from './20260611_215117';
import * as migration_20260611_225904 from './20260611_225904';
import * as migration_20260613_023047 from './20260613_023047';
import * as migration_20260613_155214 from './20260613_155214';
import * as migration_20260613_165918 from './20260613_165918';
import * as migration_20260617_010308_add_machines_fields from './20260617_010308_add_machines_fields';
import * as migration_20260622_231416_add_ghost_link_appearance from './20260622_231416_add_ghost_link_appearance';
import * as migration_20260623_021431_add_card_grid_item_media from './20260623_021431_add_card_grid_item_media';
import * as migration_20260705_225615_add_simple_hero_type from './20260705_225615_add_simple_hero_type';
import * as migration_20260706_025859_remove_specs_features_layout_add_hero_fields from './20260706_025859_remove_specs_features_layout_add_hero_fields';
import * as migration_20260706_212143_add_mcp_plugin from './20260706_212143_add_mcp_plugin';
import * as migration_20260707_175738_add_machines_projects_seo_meta from './20260707_175738_add_machines_projects_seo_meta';
import * as migration_20260708_144541_add_brands_claims_support_hub from './20260708_144541_add_brands_claims_support_hub';
import * as migration_20260717_002705_add_modal_form_link_type from './20260717_002705_add_modal_form_link_type';
import * as migration_20260717_015506_add_header_cta_modal_type from './20260717_015506_add_header_cta_modal_type';
import * as migration_20260717_022345_add_header_nav_item_hidden from './20260717_022345_add_header_nav_item_hidden';
import * as migration_20260720_214945_add_claims_refund_fields from './20260720_214945_add_claims_refund_fields';
import * as migration_20260720_220130_fix_exports_imports_drift from './20260720_220130_fix_exports_imports_drift';
import * as migration_20260721_003126_add_sync_claim_task from './20260721_003126_add_sync_claim_task';
import * as migration_20260721_012312_add_consent_logs from './20260721_012312_add_consent_logs';
import * as migration_20260723_025917_add_claim_form_intro_content from './20260723_025917_add_claim_form_intro_content';
import * as migration_20260723_041027_rename_claims_customer_name_to_first_last from './20260723_041027_rename_claims_customer_name_to_first_last';
import * as migration_20260723_043715_simplify_claims_location_and_add_claim_form_messages from './20260723_043715_simplify_claims_location_and_add_claim_form_messages';
import * as migration_20260723_170023_add_jotform_form_id_setting from './20260723_170023_add_jotform_form_id_setting';
import * as migration_20260723_211756_add_claims_photo_key from './20260723_211756_add_claims_photo_key';
import * as migration_20260724_001423_add_monday_integration from './20260724_001423_add_monday_integration';
import * as migration_20260724_012544_add_default_claim_integration_target from './20260724_012544_add_default_claim_integration_target';
import * as migration_20260724_034405_add_generic_form_monday_sync from './20260724_034405_add_generic_form_monday_sync';

export const migrations = [
  {
    up: migration_20260611_030447.up,
    down: migration_20260611_030447.down,
    name: '20260611_030447',
  },
  {
    up: migration_20260611_164448.up,
    down: migration_20260611_164448.down,
    name: '20260611_164448',
  },
  {
    up: migration_20260611_164757.up,
    down: migration_20260611_164757.down,
    name: '20260611_164757',
  },
  {
    up: migration_20260611_171403.up,
    down: migration_20260611_171403.down,
    name: '20260611_171403',
  },
  {
    up: migration_20260611_215117.up,
    down: migration_20260611_215117.down,
    name: '20260611_215117',
  },
  {
    up: migration_20260611_225904.up,
    down: migration_20260611_225904.down,
    name: '20260611_225904',
  },
  {
    up: migration_20260613_023047.up,
    down: migration_20260613_023047.down,
    name: '20260613_023047',
  },
  {
    up: migration_20260613_155214.up,
    down: migration_20260613_155214.down,
    name: '20260613_155214',
  },
  {
    up: migration_20260613_165918.up,
    down: migration_20260613_165918.down,
    name: '20260613_165918',
  },
  {
    up: migration_20260617_010308_add_machines_fields.up,
    down: migration_20260617_010308_add_machines_fields.down,
    name: '20260617_010308_add_machines_fields',
  },
  {
    up: migration_20260622_231416_add_ghost_link_appearance.up,
    down: migration_20260622_231416_add_ghost_link_appearance.down,
    name: '20260622_231416_add_ghost_link_appearance',
  },
  {
    up: migration_20260623_021431_add_card_grid_item_media.up,
    down: migration_20260623_021431_add_card_grid_item_media.down,
    name: '20260623_021431_add_card_grid_item_media',
  },
  {
    up: migration_20260705_225615_add_simple_hero_type.up,
    down: migration_20260705_225615_add_simple_hero_type.down,
    name: '20260705_225615_add_simple_hero_type',
  },
  {
    up: migration_20260706_025859_remove_specs_features_layout_add_hero_fields.up,
    down: migration_20260706_025859_remove_specs_features_layout_add_hero_fields.down,
    name: '20260706_025859_remove_specs_features_layout_add_hero_fields',
  },
  {
    up: migration_20260706_212143_add_mcp_plugin.up,
    down: migration_20260706_212143_add_mcp_plugin.down,
    name: '20260706_212143_add_mcp_plugin',
  },
  {
    up: migration_20260707_175738_add_machines_projects_seo_meta.up,
    down: migration_20260707_175738_add_machines_projects_seo_meta.down,
    name: '20260707_175738_add_machines_projects_seo_meta',
  },
  {
    up: migration_20260708_144541_add_brands_claims_support_hub.up,
    down: migration_20260708_144541_add_brands_claims_support_hub.down,
    name: '20260708_144541_add_brands_claims_support_hub',
  },
  {
    up: migration_20260717_002705_add_modal_form_link_type.up,
    down: migration_20260717_002705_add_modal_form_link_type.down,
    name: '20260717_002705_add_modal_form_link_type',
  },
  {
    up: migration_20260717_015506_add_header_cta_modal_type.up,
    down: migration_20260717_015506_add_header_cta_modal_type.down,
    name: '20260717_015506_add_header_cta_modal_type',
  },
  {
    up: migration_20260717_022345_add_header_nav_item_hidden.up,
    down: migration_20260717_022345_add_header_nav_item_hidden.down,
    name: '20260717_022345_add_header_nav_item_hidden',
  },
  {
    up: migration_20260720_214945_add_claims_refund_fields.up,
    down: migration_20260720_214945_add_claims_refund_fields.down,
    name: '20260720_214945_add_claims_refund_fields',
  },
  {
    up: migration_20260720_220130_fix_exports_imports_drift.up,
    down: migration_20260720_220130_fix_exports_imports_drift.down,
    name: '20260720_220130_fix_exports_imports_drift',
  },
  {
    up: migration_20260721_003126_add_sync_claim_task.up,
    down: migration_20260721_003126_add_sync_claim_task.down,
    name: '20260721_003126_add_sync_claim_task',
  },
  {
    up: migration_20260721_012312_add_consent_logs.up,
    down: migration_20260721_012312_add_consent_logs.down,
    name: '20260721_012312_add_consent_logs',
  },
  {
    up: migration_20260723_025917_add_claim_form_intro_content.up,
    down: migration_20260723_025917_add_claim_form_intro_content.down,
    name: '20260723_025917_add_claim_form_intro_content',
  },
  {
    up: migration_20260723_041027_rename_claims_customer_name_to_first_last.up,
    down: migration_20260723_041027_rename_claims_customer_name_to_first_last.down,
    name: '20260723_041027_rename_claims_customer_name_to_first_last',
  },
  {
    up: migration_20260723_043715_simplify_claims_location_and_add_claim_form_messages.up,
    down: migration_20260723_043715_simplify_claims_location_and_add_claim_form_messages.down,
    name: '20260723_043715_simplify_claims_location_and_add_claim_form_messages',
  },
  {
    up: migration_20260723_170023_add_jotform_form_id_setting.up,
    down: migration_20260723_170023_add_jotform_form_id_setting.down,
    name: '20260723_170023_add_jotform_form_id_setting',
  },
  {
    up: migration_20260723_211756_add_claims_photo_key.up,
    down: migration_20260723_211756_add_claims_photo_key.down,
    name: '20260723_211756_add_claims_photo_key',
  },
  {
    up: migration_20260724_001423_add_monday_integration.up,
    down: migration_20260724_001423_add_monday_integration.down,
    name: '20260724_001423_add_monday_integration',
  },
  {
    up: migration_20260724_012544_add_default_claim_integration_target.up,
    down: migration_20260724_012544_add_default_claim_integration_target.down,
    name: '20260724_012544_add_default_claim_integration_target',
  },
  {
    up: migration_20260724_034405_add_generic_form_monday_sync.up,
    down: migration_20260724_034405_add_generic_form_monday_sync.down,
    name: '20260724_034405_add_generic_form_monday_sync'
  },
];
