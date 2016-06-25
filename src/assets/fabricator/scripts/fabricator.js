require('./prism');

/**
 * Global `fabricator` object
 * @namespace
 */
const fabricator = window.fabricator = {};


/**
 * Default options
 * @type {Object}
 */
fabricator.options = {
  toggles: {
    labels: true,
    notes: true,
    code: false,
  },
  menu: false,
  mq: '(min-width: 60em)',
};

// open menu by default if large screen
fabricator.options.menu = window.matchMedia(fabricator.options.mq).matches;

/**
 * Feature detection
 * @type {Object}
 */
fabricator.test = {};

// test for sessionStorage
fabricator.test.sessionStorage = (() => {
  const test = '_f';
  try {
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
})();

// create storage object if it doesn't exist; store options
if (fabricator.test.sessionStorage) {
  sessionStorage.fabricator = sessionStorage.fabricator || JSON.stringify(fabricator.options);
}


/**
 * Cache DOM
 * @type {Object}
 */
fabricator.dom = {
  root: document.querySelector('html'),
  primaryMenu: document.querySelector('.f-menu'),
  menuItems: document.querySelectorAll('.f-menu li a'),
  menuToggle: document.querySelector('.f-menu-toggle'),
};


/**
 * Get current option values from session storage
 * @return {Object}
 */
fabricator.getOptions = () => {
  return (fabricator.test.sessionStorage) ? JSON.parse(sessionStorage.fabricator) : fabricator.options;
};


/**
 * Build color chips
 */
fabricator.buildColorChips = () => {

  const chips = document.querySelectorAll('.f-color-chip');

  for (let i = chips.length - 1; i >= 0; i--) {
    const color = chips[i].querySelector('.f-color-chip__color').innerHTML;
    chips[i].style.borderTopColor = color;
    chips[i].style.borderBottomColor = color;
  }

  return fabricator;

};


/**
 * Add `f-active` class to active menu item
 */
fabricator.setActiveItem = () => {

  /**
   * Match the window location with the menu item, set menu item as active
   */
  const setActive = () => {

    // get current file and hash without first slash
    const loc = (window.location.pathname + window.location.hash);
    const current = loc.replace(/(^\/)([^#]+)?(#[\w\-\.]+)?$/ig, (match, slash, file, hash) => {
      return (file || '') + (hash || '').split('.')[0];
    }) || 'index.html';


    // find the current section in the items array
    for (let i = fabricator.dom.menuItems.length - 1; i >= 0; i--) {

      const item = fabricator.dom.menuItems[i];

      // get item href without first slash
      const href = item.getAttribute('href').replace(/^\//g, '');

      if (href === current) {
        item.classList.add('f-active');
      } else {
        item.classList.remove('f-active');
      }

    }

  };

  window.addEventListener('hashchange', setActive);

  setActive();

  return fabricator;

};


/**
 * Click handler to primary menu toggle
 * @return {Object} fabricator
 */
fabricator.menuToggle = () => {

  // shortcut menu DOM
  const toggle = fabricator.dom.menuToggle;
  const options = fabricator.getOptions();

  // toggle classes on certain elements
  const toggleClasses = () => {
    options.menu = !fabricator.dom.root.classList.contains('f-menu-active');
    fabricator.dom.root.classList.toggle('f-menu-active');

    if (fabricator.test.sessionStorage) {
      sessionStorage.setItem('fabricator', JSON.stringify(options));
    }
  };

  // toggle classes on ctrl + m press
  document.onkeydown = (e) => {
    if (e.ctrlKey && e.keyCode === 'M'.charCodeAt(0)) {
      toggleClasses();
    }
  };

  // toggle classes on click
  toggle.addEventListener('click', () => {
    toggleClasses();
  });

  // close menu when clicking on item (for collapsed menu view)
  const closeMenu = () => {
    if (!window.matchMedia(fabricator.options.mq).matches) {
      toggleClasses();
    }
  };

  for (let i = 0; i < fabricator.dom.menuItems.length; i++) {
    fabricator.dom.menuItems[i].addEventListener('click', closeMenu);
  }

  return fabricator;

};


/**
 * Handler for preview and code toggles
 * @return {Object} fabricator
 */
fabricator.allItemsToggles = () => {

  const itemCache = {
    labels: document.querySelectorAll('[data-f-toggle="labels"]'),
    notes: document.querySelectorAll('[data-f-toggle="notes"]'),
    code: document.querySelectorAll('[data-f-toggle="code"]'),
  };

  const toggleAllControls = document.querySelectorAll('.f-controls [data-f-toggle-control]');
  const options = fabricator.getOptions();

  // toggle all
  const toggleAllItems = (type, value) => {

    const button = document.querySelector(`.f-controls [data-f-toggle-control=${type}]`);
    const items = itemCache[type];

    for (let i = 0; i < items.length; i++) {
      if (value) {
        items[i].classList.remove('f-item-hidden');
      } else {
        items[i].classList.add('f-item-hidden');
      }
    }

    // toggle styles
    if (value) {
      button.classList.add('f-active');
    } else {
      button.classList.remove('f-active');
    }

    // update options
    options.toggles[type] = value;

    if (fabricator.test.sessionStorage) {
      sessionStorage.setItem('fabricator', JSON.stringify(options));
    }

  };

  for (let i = 0; i < toggleAllControls.length; i++) {

    toggleAllControls[i].addEventListener('click', (e) => {

      // extract info from target node
      const type = e.currentTarget.getAttribute('data-f-toggle-control');
      const value = e.currentTarget.className.indexOf('f-active') < 0;

      // toggle the items
      toggleAllItems(type, value);

    });

  }

  // persist toggle options from page to page
  Object.keys(options.toggles).forEach((key) => {
    toggleAllItems(key, options.toggles[key]);
  });

  return fabricator;

};


/**
 * Handler for single item code toggling
 */
fabricator.singleItemToggle = () => {

  const itemToggleSingle = document.querySelectorAll('.f-item-group [data-f-toggle-control]');

  // toggle single
  const toggleSingleItemCode = (e) => {
    const group = e.currentTarget.parentNode.parentNode.parentNode;
    const type = e.currentTarget.getAttribute('data-f-toggle-control');
    group.querySelector(`[data-f-toggle=${type}]`).classList.toggle('f-item-hidden');
  };

  for (let i = 0; i < itemToggleSingle.length; i++) {
    itemToggleSingle[i].addEventListener('click', toggleSingleItemCode);
  }

  return fabricator;

};


/**
 * Automatically select code when code block is clicked
 */
fabricator.bindCodeAutoSelect = () => {

  const codeBlocks = document.querySelectorAll('.f-item-code');

  const select = (block) => {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(block.querySelector('code'));
    selection.removeAllRanges();
    selection.addRange(range);
  };

  for (let i = codeBlocks.length - 1; i >= 0; i--) {
    codeBlocks[i].addEventListener('click', select.bind(this, codeBlocks[i]));
  }

};


/**
 * Open/Close menu based on session var.
 * Also attach a media query listener to close the menu when resizing to smaller screen.
 */
fabricator.setInitialMenuState = () => {

  // root element
  const root = document.querySelector('html');

  const mq = window.matchMedia(fabricator.options.mq);

  // if small screen
  const mediaChangeHandler = (list) => {
    if (!list.matches) {
      root.classList.remove('f-menu-active');
    } else {
      if (fabricator.getOptions().menu) {
        root.classList.add('f-menu-active');
      } else {
        root.classList.remove('f-menu-active');
      }
    }
  };

  mq.addListener(mediaChangeHandler);
  mediaChangeHandler(mq);

  return fabricator;

};


/**
 * Initialization
 */
fabricator
 .setInitialMenuState()
 .menuToggle()
 .allItemsToggles()
 .singleItemToggle()
 .buildColorChips()
 .setActiveItem()
 .bindCodeAutoSelect();
