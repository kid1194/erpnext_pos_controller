# ERPNext POS Controller © 2022
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to license.txt


import frappe
from frappe.utils import cint


_SETTINGS_DOCTYPE = "POS Controller Settings"
_SETTINGS_CACHE_KEY = "pos_controller_settings"


@frappe.whitelist()
def get_settings():
    user = frappe.session.user
    cache = frappe.cache().hget(_SETTINGS_CACHE_KEY, user)
    result = {
        "enabled": False,
        "default_item_max_total": 0,
        "restrict_all_items_max_total": False,
        "restricted_items": {},
        "max_total_error": "",
    }
    
    if isinstance(cache, dict):
        result.update(cache)
        return result
    
    status = 0
    settings = frappe.get_cached_doc(_SETTINGS_DOCTYPE, _SETTINGS_DOCTYPE)
    
    if not settings.enabled:
        status = 2
    
    if not status:
        if settings.apply_settings_for_all_users:
            status = 1
        elif settings.applicable_users:
            users = [v.user for v in settings.applicable_users]
            if users:
                status = 1 if user in users else 2
    
    if status == 1:
        result["enabled"] = True
        result["default_item_max_total"] = cint(settings.default_item_max_total)
        result["restrict_all_items_max_total"] = True if settings.restrict_all_items_max_total else False
        result["restricted_items"] = {v.item:cint(v.max_total) for v in settings.restricted_items}
        result["max_total_error"] = settings.max_total_error
    
    frappe.cache().hset(_SETTINGS_CACHE_KEY, user, result)
    return result