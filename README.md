# ERPNext POS Controller (Alpha)

ERPNext plugin that helps in adding some restrictions over default POS.

---

### Table of Contents
<ul>
    <li><a href="#requirements">Requirements</a></li>
    <li>
        <a href="#setup">Setup</a>
        <ul>
            <li><a href="#install">Install</a></li>
            <li><a href="#update">Update</a></li>
            <li><a href="#uninstall">Uninstall</a></li>
        </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
</ul>

---

### Requirements
- Frappe >= v13.0.0
- ERPNext >= v13.0.0

---

### Setup

⚠️ *Important* ⚠️

*Do not forget to replace [sitename] with the name of your site in all commands.*

#### Install
1. Go to bench directory

```
cd ~/frappe-bench
```

2. Get plugin from Github

*(Required only once)*

```
bench get-app https://github.com/kid1194/erpnext_pos_controller
```

3. Build plugin

*(Required only once)*

```
bench build --apps erpnext_pos_controller
```

4. Install plugin on a specific site

```
bench --site [sitename] install-app erpnext_pos_controller
```

5. Check the usage section below

#### Update
1. Go to app directory

```
cd ~/frappe-bench/apps/erpnext_pos_controller
```

2. Get updates from Github

```
git pull
```

3. Go to bench directory

```
cd ~/frappe-bench
```

4. Build plugin

```
bench build --apps erpnext_pos_controller
```

5. Update a specific site

```
bench --site [sitename] migrate
```

6. Restart bench

```
bench restart
```

#### Uninstall
1. Go to bench directory

```
cd ~/frappe-bench
```

2. Uninstall plugin from a specific site

```
bench --site [sitename] uninstall-app erpnext_pos_controller
```

3. Remove plugin from bench

```
bench remove-app erpnext_pos_controller
```

4. Restart bench

```
bench restart
```

---

### Usage
1. Go to **POS Controller Settings**
2. Check the **Is Enabled** box
3. Apply the settings to all users or choose the **Applicable Users** that you want
4. Check the **Restrict Max Total For All Items* box to apply the **Default Item Max Total** to all items or choose the **Restrict Items** that you want

---

### License
MIT
