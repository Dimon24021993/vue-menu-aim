# vue-menu-aim

menu with triangle, for vue (:

## Install

```sh
npm i -S vue-menu-aim
```

```js
import vueMenuAim from "vue-menu-aim";
Vue.use(vueMenuAim);
```

## Use

```vue
<v-list class="menu-aim">
  <template v-for="(element) in catalog">
    <v-list-tile :key="element.title" :to="`/groups/${element.id}`" class="menu-li">
      <v-list-tile-content class="main-group-title">{{element.title}}</v-list-tile-content>
      <v-list-tile-action>
        <v-icon color="grey">navigate_next</v-icon>
      </v-list-tile-action>
    </v-list-tile>
  </template>
</v-list>
```

```js
mounted() {
 //if use v-menu for this - need add top and left options in configure
 //also can use $refs
    var activator = document.querySelector(".v-menu__activator");
    this.vueMenuAim(document.querySelectorAll(".menu-aim"), {
      rowSelector: ".menu-li .v-list__tile",
      top: activator.offsetHeight,
      left: activator.offsetLeft,
      activate: row => {
        //active row (HTMLElement)
      }
    });
  },
```

### Options

```js
{
     // Function to call when a row is purposefully activated. Use this
     // to show a submenu's content for the activated row.
     activate: function() {},

     // Function to call when a row is deactivated.
     deactivate: function() {},

     // Function to call when mouse enters a menu row. Entering a row
     // does not mean the row has been activated, as the user may be
     // mousing over to a submenu.
     enter: function() {},

     // Function to call when mouse exits a menu row.
     exit: function() {},

     // Function to call when mouse exits the entire menu. If this returns
     // true, the current row's deactivation event and callback function
     // will be fired. Otherwise, if this isn't supplied or it returns
     // false, the currently activated row will stay activated when the
     // mouse leaves the menu entirely.
     exitMenu: function() {},

     // Selector for identifying which elements in the menu are rows
     // that can trigger the above events. Defaults to "> li".
     rowSelector: "> li",

     // You may have some menu rows that aren't submenus and therefore
     // shouldn't ever need to "activate." If so, filter submenu rows w/
     // this selector. Defaults to "*" (all elements).
     submenuSelector: "*",

     // Direction the submenu opens relative to the main menu. This
     // controls which direction is "forgiving" as the user moves their
     // cursor from the main menu into the submenu. Can be one of "right",
     // "left", "above", or "below". Defaults to "right".
     submenuDirection: "right",

     // Top side to menu (need if use Vuetify v-menu component)
     // and for top corners of menu square
     // Default $menu.offsetTop
     top: 0,

     // Left side to menu (need if use Vuetify v-menu component)
     // and for left corners of menu square
     // Default $menu.offsetLeft
     left: 0,

     // Width of menu
     // Used for create move angle from menu to submenu
     // Default $menu.offsetWidth
     width: 0,

     // Height of menu
     // Used for create move angle from menu to submenu
     // Default $menu.offsetHeight
     height: 0
 }
```

## License

[MIT](LICENSE)
