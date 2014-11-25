(function () {

    function initInputs(box) {
        box.propList.forEach(function (prop) {
            var elem = box.inputs[prop] = box.root.querySelector('input[data-prop=' + prop + ']');
            elem.oninput = function () {
                var value = elem.value;
                console.log('elem.oninput()', value, elem);
                box.setValue(prop, value);
            };
            var link = box.root.querySelector('.link[data-prop=' + prop + ']');
            if (link) {
                box.links[prop] = link;
            }
        });
    }


    function BoxModel(root, property) {
        this.root = root;
        this.example = root.querySelector('.box-model');
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
        this.inputs = {};
        this.links = {};
        initInputs(this);
        this.update();
    }

    BoxModel.isEmpty = function (value) {
        return value === '';
    };

    BoxModel.prototype.each = function (callback) {
        this.propList.forEach(function (prop) {
            callback.call(this, prop, this.values[prop], this.inputs[prop]);
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
        var style = [this.values.top, this.values.right, this.values.bottom, this.values.left].join(' ');
        if (!style.trim().length) {
            style = '0';
        }
        this.example.style[this.property] = style;
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

})();