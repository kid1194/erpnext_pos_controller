# ERPNext POS Controller © 2022
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to license.txt


import frappe
from frappe import _
from frappe.model.document import Document

from erpnext_pos_controller.api.handler import _SETTINGS_DOCTYPE, _SETTINGS_CACHE_KEY


class POSControllerSettings(Document):
    def before_validate(self):
        if self.restrict_all_items_max_total:
            self.items = []
    
    def validate(self):
        if not self.restrict_all_items_max_total and not self.items:
            frappe.throw(
                _("Please add at least one item to the items table."),
                title=_SETTINGS_DOCTYPE
            )
    
    def before_save(self):
	    frappe.clear_cache(doctype=_SETTINGS_DOCTYPE)
	    frappe.cache().hdel(_SETTINGS_CACHE_KEY, frappe.session.user)
