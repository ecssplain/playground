(function () {

    function initInputs(box) {
        box.propList.forEach(function (prop) {
            var elem = box.inputs[prop] = box.root.querySelector('input[data-prop=' + prop + ']');
            elem.oninput = function () {
                var value = elem.value;
                console.log('elem.oninput()', value, elem);
                box.setValue(prop, value);
            };
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
        this.propList = ['top', 'right', 'bottom', 'left']; // Maintain exact order
        this.inputs = {};
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
            if (elem.value !== value) {
                elem.value = value;
            }
            elem.classList[BoxModel.isEmpty(value) ? 'add' : 'remove']('empty');
        });
        this.example.style[this.property] = [this.values.top, this.values.right, this.values.bottom, this.values.left].join(' ');
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

    window.paddingBox = new BoxModel(document.getElementById('shorthand'), 'padding');

})();