function vueMenuAim(targets, opts) {
  // Initialize vue-vue-menu-aim for all elements in HTMLCollection
  Array.prototype.slice.call(targets).forEach(function (elem) {
    init.call(this, opts, elem);
  });
  return this;
}

function noop() { }

function init(opts, $menu) {
  let activeRow = null,
    lastDelayLoc = null,
    timeoutId = null;
  const defaultDelay = 300,
    mouseLocs = [],
    options = {
      rowSelector: '> li',
      submenuSelector: '*',
      submenuDirection: 'right',
      tolerance: 75, // bigger = more forgivey when entering submenu
      delay: defaultDelay,
      enter: noop,
      exit: noop,
      activate: noop,
      deactivate: noop,
      exitMenu: noop,
    };

  for (const k in opts) { options[k] = opts[k]; }

  const MOUSE_LOCS_TRACKED = 3, // number of past mouse locations to track
    DELAY = options.delay > 0 ? options.delay : defaultDelay; // ms delay when user appears to be entering submenu

  /**
   * Keep track of the last few locations of the mouse.
   */
  const mousemoveDocument = function (e) {
    mouseLocs.push({
      x: e.pageX,
      y: e.pageY,
    });

    if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
      mouseLocs.shift();
    }
  };

  /**
   * Cancel possible row activations when leaving the menu entirely
   */
  const mouseleaveMenu = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // If exitMenu is supplied and returns true, deactivate the
    // currently active row on menu exit.
    if (options.exitMenu(this)) {
      if (activeRow) {
        options.deactivate(activeRow);
      }

      activeRow = null;
    }
  };

  /**
   * Trigger a possible row activation whenever entering a new row.
   */
  const mouseenterRow = function () {
    if (timeoutId) {
      // Cancel any previous activation delays
      clearTimeout(timeoutId);
    }

    options.enter(this);
    possiblyActivate(this);
  };

  const mouseleaveRow = function () {
    options.exit(this);
  };

  /*
   * Immediately activate a row if the user clicks on it.
   */
  const clickRow = function () {
    activate(this);
  };

  /**
   * Activate a menu row.
   */
  const activate = function (row) {
    if (row === activeRow) {
      return;
    }

    if (activeRow) {
      options.deactivate(activeRow);
    }

    options.activate(row);
    activeRow = row;
  };

  /**
   * Possibly activate a menu row. If mouse movement indicates that we
   * shouldn't activate yet because user may be trying to enter
   * a submenu's content, then delay and check again later.
   */
  const possiblyActivate = function (row) {
    const delay = activationDelay();
    if (delay) {
      timeoutId = setTimeout(() => {
        possiblyActivate(row);
      }, delay);
    } else {
      activate(row);
    }
  };

  const menuPageOffsetTop = function () {
    return $menu.getBoundingClientRect().y + $menu.ownerDocument.defaultView.scrollY;
  };

  const menuPageOffsetLeft = function () {
    return $menu.getBoundingClientRect().x + $menu.ownerDocument.defaultView.scrollX;
  };

  /**
   * Return the amount of time that should be used as a delay before the
   * currently hovered row is activated.
   *
   * Returns 0 if the activation should happen immediately. Otherwise,
   * returns the number of milliseconds that should be delayed before
   * checking again to see if the row should be activated.
   */
  const activationDelay = function () {
    //todo check another way to do this job
    //  if (activeRow === null || !$(activeRow).is(options.submenuSelector)) {
    //    // If there is no other submenu row already active, then
    //    // go ahead and activate immediately.
    //    return 0;
    //  }

    const offset = {
      top: options.top || menuPageOffsetTop(),
      left: options.left || menuPageOffsetLeft(),
      width: options.width || $menu.offsetWidth,
      height: options.height || $menu.offsetHeight,
    };
    const upperLeft = {
      x: offset.left,
      y: offset.top - options.tolerance,
    };
    const upperRight = {
      x: offset.left + offset.width,
      y: upperLeft.y,
    };
    const lowerLeft = {
      x: offset.left,
      y: offset.top + offset.height + options.tolerance,
    };
    const lowerRight = {
      x: offset.left + offset.width,
      y: lowerLeft.y,
    };
    const loc = mouseLocs[mouseLocs.length - 1];
    let prevLoc = mouseLocs[0];

    if (!loc) {
      return 0;
    }

    if (!prevLoc) {
      prevLoc = loc;
    }

    if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x ||
      prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
      // If the previous mouse location was outside of the entire
      // menu's bounds, immediately activate.
      return 0;
    }

    if (lastDelayLoc &&
      loc.x === lastDelayLoc.x && loc.y === lastDelayLoc.y) {
      // If the mouse hasn't moved since the last time we checked
      // for activation status, immediately activate.
      return 0;
    }

    // Detect if the user is moving towards the currently activated
    // submenu.
    //
    // If the mouse is heading relatively clearly towards
    // the submenu's content, we should wait and give the user more
    // time before activating a new row. If the mouse is heading
    // elsewhere, we can immediately activate a new row.
    //
    // We detect this by calculating the slope formed between the
    // current mouse location and the upper/lower right points of
    // the menu. We do the same for the previous mouse location.
    // If the current mouse location's slopes are
    // increasing/decreasing appropriately compared to the
    // previous's, we know the user is moving toward the submenu.
    //
    // Note that since the y-axis increases as the cursor moves
    // down the screen, we are looking for the slope between the
    // cursor and the upper right corner to decrease over time, not
    // increase (somewhat counterintuitively).
    function slope(a, b) {
      return (b.y - a.y) / (b.x - a.x);
    }

    let decreasingCorner = upperRight,
      increasingCorner = lowerRight;

    // Our expectations for decreasing or increasing slope values
    // depends on which direction the submenu opens relative to the
    // main menu. By default, if the menu opens on the right, we
    // expect the slope between the cursor and the upper right
    // corner to decrease over time, as explained above. If the
    // submenu opens in a different direction, we change our slope
    // expectations.
    if (options.submenuDirection === 'left') {
      decreasingCorner = lowerLeft;
      increasingCorner = upperLeft;
    } else if (options.submenuDirection === 'below') {
      decreasingCorner = lowerRight;
      increasingCorner = lowerLeft;
    } else if (options.submenuDirection === 'above') {
      decreasingCorner = upperLeft;
      increasingCorner = upperRight;
    }

    const decreasingSlope = slope(loc, decreasingCorner),
      increasingSlope = slope(loc, increasingCorner),
      prevDecreasingSlope = slope(prevLoc, decreasingCorner),
      prevIncreasingSlope = slope(prevLoc, increasingCorner);

    if (decreasingSlope < prevDecreasingSlope &&
      increasingSlope > prevIncreasingSlope) {
      // Mouse is moving from previous location towards the
      // currently activated submenu. Delay before activating a
      // new menu row, because user may be moving into submenu.
      lastDelayLoc = loc;
      return DELAY;
    }

    lastDelayLoc = null;

    return 0;
  };

  /**
   * Hook up initial menu events
   */
  $menu.addEventListener('mouseleave', mouseleaveMenu);
  const rows = $menu.querySelectorAll(`:scope ${options.rowSelector}`);
  Array.prototype.slice.call(rows).forEach((row) => {
    row.addEventListener('mouseenter', mouseenterRow);
    row.addEventListener('mouseleave', mouseleaveRow);
    row.addEventListener('click', clickRow);
  });

  document.addEventListener('mousemove', mousemoveDocument);
}

export default {
  install: (app) => {
    app.config.globalProperties.vueMenuAim = vueMenuAim;
  },
};
