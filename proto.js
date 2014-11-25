(function () {

    Tangle.classes.ECLinkedValue = {
        initialize: function (elem, options, tangle, variable) {
            console.log('ECLinkedValue.initialize()', arguments);
            this.previous = options.previous;
            this.tangle = tangle;

            elem.addEventListener('input', function () {
                var value = elem.value;
                console.log('elem.oninput()', value, elem);
                tangle.setValue(variable, value);
            }, false);
        },
        update: function (elem, value, fallbackValue, superFallbackValue) {
            console.log('ECLinkedValue.update()', arguments);
            if (elem.value !== value) {
                elem.value = value;
            }
            elem.classList[this.isEmpty(value) ? 'add' : 'remove']('empty');

            // Make sure parent has a value
            if (this.previous && !this.isEmpty(value)) {
                var previousValue = this.tangle.getValue(this.previous);
                if (this.isEmpty(previousValue)) {
                    this.tangle.setValue(this.previous, 0);
                }
            }
        },
        isEmpty: function (value) {
            return value === '';
        }
    };

    var root = document.getElementById('shorthand');
    var example = root.querySelector('.box-model');

    var tangle = new Tangle(root, {
        initialize: function () {
            console.log('Tangle.initialize()', arguments);
            this.top = '1em';
            this.right = '';
            this.bottom = '';
            this.left = '';
        },
        update: function () {
            console.log('Tangle.update()', arguments);
            example.style.padding = [this.top, this.right, this.bottom, this.left].join(' ');
        }
    });

    window.tangle = tangle;

})();