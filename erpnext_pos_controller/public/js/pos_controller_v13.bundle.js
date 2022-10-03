/*
*  ERPNext POS Controller © 2022
*  Author:  Ameen Ahmed
*  Company: Level Up Marketing & Software Development Services
*  Licence: Please refer to license.txt
*/

if (!erpnext.PointOfSale.Controller) {
    throw new Error('The POS Controller is not loaded yet.');
}

class POSControllerSettings {
    constructor(data) {
        $.extend(this, data);
        if (this.max_total_error) {
            this.max_total_error = this.max_total_error
                .replace(/\{item\}/g, '{0}')
                .replace(/\{max_total\}/g, '{1}');
        }
    }
    is_valid(doc, name, total, check) {
        let max_total = this.get_max_total(name);
        if (max_total >= 0 && total > max_total) {
            if (!check) {
                frappe.msgprint({
                    title: __('Total Error'),
                    indicator: 'red',
                    message: __(
                        this.max_total_error,
                        [name, format_currency(max_total, doc.currency || null)]
                    )
                });
            }
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
            if (me.payment) me.init_payments_settings();
        });
    }
    init_payments() {
        super.init_payments();
        this.init_payments_settings();
    }
    init_payments_settings() {
        if (!this._payment_ready && this._settings && this._settings.enabled) {
            this.payment.set_controller_settings(this._settings);
            this._payment_ready = true;
        }
    }
};
erpnext.PointOfSale.Payment = class PointOfSalePayment extends erpnext.PointOfSale.Payment {
    set_controller_settings(data) {
        this._settings = data;
    }
    checkout() {
        if (this._settings && this._settings.enabled) {
            var frm = this.events.get_frm();
            if (frm && frm.doc && frm.doc.items && frm.doc.items.length) {
                var doc = frm.doc,
                items = doc.items,
                l = items.length,
                i = 0,
                is_valid = true;
                for (; i < l; i++) {
                    let name = items[i].name,
                    total = flt(items[i].rate) * flt(items[i].qty);
                    if (!this._settings.is_valid(doc, name, total)) {
                        is_valid = false;
                    }
                }
                if (!is_valid) return;
            }
        }
        super.checkout();
    }
};