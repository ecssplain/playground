(function () {

    function initElems(box) {
        box.exampleRoot = box.root.querySelector('.box-model');
        box.propList.forEach(function (prop) {
            var elem = box.inputs[prop] = box.root.querySelector('input[data-prop=' + prop + ']');
            elem.addEventListener('input', function () {
                var value = elem.value;
                console.log('elem.oninput()', value, elem);
                box.setValue(prop, value);
            }, false);
            var link = box.root.querySelector('.link[data-prop=' + prop + ']');
            if (link) {
                box.links[prop] = link;
            }
            box.exampleGuides[prop] = box.exampleRoot.querySelector('.guide[data-prop=' + prop + ']');
        });

        box.rawValue = box.root.querySelector('.raw-value input');
        box.rawValue.addEventListener('input', function () {
            var value = this.value;
            console.log('rawValue.oninput()', value);
            box.setRawValue(value);
        }, false);
    }


    function BoxModel(root, property) {
        this.root = root;
        this.property = property;
        this.values = {
            top: '1em',
            right: '',
            bottom: '',
            left: ''
        };
        this.derivedValues = {
            right: 'top',
            bottom: 'top',
            left: 'right'
        };
        this.propList = ['top', 'right', 'bottom', 'left']; // Maintain exact order

        // Elements
        this.inputs = {};
        this.links = {};
        this.rawValue = null;
        this.exampleRoot = null;
        this.exampleGuides = {};
        initElems(this);

        this.update();
    }

    BoxModel.isEmpty = function (value) {
        return value === '';
    };

    BoxModel.prototype.each = function (callback) {
        this.propList.forEach(function (prop, i) {
            callback.call(this, prop, this.values[prop], this.inputs[prop], i);
        }, this);
    };

    BoxModel.prototype.setValue = function (prop, value) {
        var oldValue = this.values[prop];
        console.log('BoxModel.setValue(%s):', prop, value);
        if (oldValue !== value) {
            this.values[prop] = value;
            this.update();
        }
    };

    BoxModel.prototype.setRawValue = function (value) {
        console.log('BoxModel.setRawValue():', value);
        var parts = value.trim().split(/\s+/);
        var isDirty = false;
        this.each(function (prop, oldValue, elem, i) {
            var newValue = parts[i] || '';
            if (newValue !== oldValue) {
                this.values[prop] = newValue;
                isDirty = true;
            }
        });
        if (isDirty) {
            this.update();
        }
    };

    BoxModel.prototype.update = function () {
        console.log('BoxModel.update()');
        this.enforceValidInput();
        this.each(function (prop, value, elem) {
            var isEmpty = BoxModel.isEmpty(value);
            if (elem.value !== value) {
                elem.value = value;
            }
            elem.classList[isEmpty ? 'add' : 'remove']('empty');
            // Show derived value if empty (e.g. if `left` is empty, get value from `right`)
            if (isEmpty) {
                elem.setAttribute('placeholder', this.getDerivedValue(prop));
            }
            if (this.links[prop]) {
                this.links[prop].classList[isEmpty ? 'add' : 'remove']('visible');
            }
        });

        // Update raw value
        var style = [this.values.top, this.values.right, this.values.bottom, this.values.left].join(' ').trim();
        if (!style.length) {
            style = '0';
        }
        if (style !== this.rawValue.value) {
            this.rawValue.value = style;
        }

        // Update visual example
        this.exampleRoot.style[this.property] = style;
        var computed = getComputedStyle(this.exampleRoot);
        this.each(function (prop) {
            var dimension = (prop === 'top' || prop === 'bottom') ? 'height' : 'width';
            this.exampleGuides[prop].style[dimension] = computed[this.property + '-' + prop];
        });
    };

    BoxModel.prototype.enforceValidInput = function () {
        var hasValue = false;
        var prop, elem;
        var i = this.propList.length;
        while (i--) {
            prop = this.propList[i];
            elem = this.inputs[prop];
            if (BoxModel.isEmpty(elem.value)) {
                if (hasValue) {
                    this.values[prop] = 0;
                }
            } else {
                hasValue = true;
            }
        }
    };

    BoxModel.prototype.getDerivedValue = function (prop) {
        var fallbackProp = this.derivedValues[prop];
        if (!fallbackProp) {
            return 0;
        }
        var fallbackValue = this.values[fallbackProp];
        if (BoxModel.isEmpty(fallbackValue)) {
            return this.getDerivedValue(fallbackProp);
        }
        return fallbackValue;
    };

    window.paddingBox = new BoxModel(document.getElementById('shorthand'), 'padding');


    /*** Animated values ***/

    var wraparound = document.querySelector('.wraparound');
    wraparound.querySelector('.toggle').addEventListener('click', function () {
        wraparound.classList.toggle('expanded');
    });

})();