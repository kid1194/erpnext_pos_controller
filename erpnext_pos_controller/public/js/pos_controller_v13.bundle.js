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
            if (me.item_details) me.init_item_details_settings();
            if (me.payment) me.init_payments_settings();
        });
    }
    init_item_details() {
        super.init_item_details();
        this.init_item_details_settings();
    }
    init_payments() {
        super.init_payments();
        this.init_payments_settings();
    }
    init_item_details_settings() {
        if (!this._item_details_ready && this._settings && this._settings.enabled) {
            this.item_details.set_controller_settings(this._settings);
            this._item_details_ready = true;
        }
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
erpnext.PointOfSale.ItemDetails = class PointOfSaleItemDetails extends erpnext.PointOfSale.ItemDetails {
    set_controller_settings(data) {
        this._settings = data;
    }
    bind_custom_control_change_event() {
        super.bind_custom_control_change_event();
        if (this._settings && this._settings.enabled) {
            var me = this;
            if (this.allow_rate_change && this.rate_control && !this.rate_control.df.read_only) {
                this._rate_control_onchange = this.rate_control.df.onchange;
                this.rate_control.df.onchange = function() {
                    var is_valid = true;
                    if (this.value && flt(this.value)) {
                        me.events.form_updated(me.doctype, me.name, 'rate', this.value).then(() => {
							let item_row = frappe.get_doc(me.doctype, me.name);
							let doc = me.events.get_frm().doc;
							let total = flt(this.value) * flt(item_row.qty);
                            if (
                                total
                                && !me._settings.is_valid(
                                    doc,
                                    me.name,
                                    total,
                                    true
                                )
                            ) {
                                is_valid = false;
                                let max_total = me._settings.get_max_total(me.name);
                                if (max_total) {
                                    $(this).val(flt(max_total) / flt(item_row.qty));
                                }
                            }
						});
                    }
                    if (me._rate_control_onchange && is_valid) me._rate_control_onchange.call(this);
                };
            }
            if (this.qty_control && !this.qty_control.df.read_only) {
                this._qty_control_onchange = this.qty_control.df.onchange;
                this.qty_control.df.onchange = function() {
                    var is_valid = true;
                    if (this.value && flt(this.value)) {
                        me.events.form_updated(me.doctype, me.name, 'qty', this.value).then(() => {
							let item_row = frappe.get_doc(me.doctype, me.name);
							let doc = me.events.get_frm().doc;
							let total = flt(item_row.rate) * flt(this.value);
                            if (
                                total
                                && !me._settings.is_valid(
                                    doc,
                                    me.name,
                                    total,
                                    true
                                )
                            ) {
                                is_valid = false;
                                let max_total = me._settings.get_max_total(me.name);
                                if (max_total) {
                                    let max_qty = flt(max_total) / flt(item_row.rate);
                                    $(this).val(cint(max_qty));
                                }
                            }
						});
                    }
                    if (me._qty_control_onchange && is_valid) me._qty_control_onchange.call(this);
                };
            }
        }
    }
};