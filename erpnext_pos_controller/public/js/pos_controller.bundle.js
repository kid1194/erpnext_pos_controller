/*
*  ERPNext POS Controller © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

class POSControllerSettings {
    constructor(data) {
        for (var k in data) {
            this[k] = data[k];
        }
    }
    is_valid(doc, name, total) {
        let max_total = this.get_max_total(name);
        if (max_total >= 0 && total > max_total) {
            frappe.throw(__(
                this.max_total_error,
                {
                    item: name,
                    max_total: format_currency(max_total, doc.currency || null)
                }
            ));
            return false;
        }
        return true;
    }
    get_max_total(name) {
        if (
            this.default_item_max_total
            && this.restrict_all_items_max_total
        ) {
            return this.default_item_max_total;
        }
        return this.restricted_items[name] == null
        ? this.restricted_items[name] : -1;
    }
}
erpnext.PointOfSale.Controller = class PointOfSaleController extends erpnext.PointOfSale.Controller {
    constructor(wrapper) {
        super(wrapper);
        
        var me = this;
        frappe.call('erpnext_pos_controller.api.handler.get_settings')
        .then(function(ret) {
            if (ret && $.isPlainObject(ret)) ret = ret.message || ret;
            if (!$.isPlainObject(ret)) {
                frappe.throw(__('[POS Controller]: The settings received is invalid.'));
                return;
            }
            me._settings = new POSControllerSettings(ret);
            if (me.item_details) me.init_item_details_settings();
        });
    }
    init_item_details() {
        super.init_item_details();
        this.init_item_details_settings();
    }
    init_item_details_settings() {
        if (!this._item_details_ready && this._settings && this._settings.enabled) {
            this.item_details.set_controller_settings(this._settings);
            this._item_details_ready = true;
        }
    }
    async save_and_checkout() {
        if (this._settings && this._settings.enabled) {
            if (
                this.frm && this.frm.doc && this.frm.doc.items
                && this.frm.doc.items.length
            ) {
                var items = this.frm.doc.items,
                l = items.length,
                i = 0;
                for (; i < l; i++) {
                    let name = items[i].name,
                    total = flt(items[i].rate) * flt(items[i].qty);
                    if (!this._settings.is_valid(this.events.get_frm().doc, name, total)) {
                        return;
                    }
                }
            }
        }
        await super.save_and_checkout();
    }
};
erpnext.PointOfSale.ItemDetails = class PointOfSaleItemDetails extends erpnext.PointOfSale.ItemDetails {
    set_controller_settings(data) {
        this._settings = data;
    }
    bind_custom_control_change_event() {
        super.bind_custom_control_change_event();
        if (this._settings && this._settings.enabled) {
            var me = this;
            if (this.rate_control && this.allow_rate_change) {
                var _rate_on_change = this.rate_control.df.onchange;
                this.rate_control.df.onchange = function() {
                    if (this.value) {
                        var item_row = frappe.get_doc(me.doctype, me.name),
                        total = flt(this.value) * flt(item_row.qty);
                        if (!me._settings.is_valid(me.events.get_frm().doc, me.name, total)) {
                            return;
                        }
                    }
                    if ((this.value || flt(this.value) === 0) && _rate_on_change) _rate_on_change.call(this);
                };
                this.rate_control.refresh();
            }
            if (this.qty_control) {
                var _qty_on_change = this.qty_control.df.onchange;
                this.qty_control.df.onchange = function() {
                    if (this.value) {
                        var item_row = frappe.get_doc(me.doctype, me.name),
                        total = flt(item_row.rate) * flt(this.value);
                        if (!me._settings.is_valid(me.events.get_frm().doc, me.name, total)) {
                            return;
                        }
                    }
                    if ((this.value || flt(this.value) === 0) && _qty_on_change) _qty_on_change.call(this);
                };
                this.qty_control.refresh();
            }
        }
    }
};