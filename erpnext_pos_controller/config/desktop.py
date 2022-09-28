# ERPNext POS Controller © 2022
# Author:  Ameen Ahmed
# Company: Level Up Marketing & Software Development Services
# Licence: Please refer to license.txt


from frappe import _


def get_data():
    return [
        {
            "module_name": "ERPNext POS Controller",
            "color": "blue",
            "icon": "octicon octicon-person",
            "type": "module",
            "label": _("ERPNext POS Controller")
        }
    ]