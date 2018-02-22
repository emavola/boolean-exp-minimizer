function CanonicSop(size, opts) {
	opts = opts || {};
	this.terms = [];
	this.allMinterms = [];
	this.termsSize = size;
	this.alpha = opts.alpha || ['x', 'y', 'z', 's', 't', 'v'];
	this.alpha = this.alpha.slice(0, size).reverse();
	this.name = opts.name;

	this.push = (num, dc) => {
		const opts = {};
		if (dc === undefined) {
			this.allMinterms.push(num);
		} else if (dc === 'dc') {
			opts.dontCare = true;
		} else {
			throw new Error('Invalid input');
		}
		const term = new Termine(this, num, opts);
		this.terms.push(term);
	};

	this.pushDontCare = num => {
		this.push(num, 'dc');
	};

	// Operazione terminale
	this.min = () => {
		const newTerms = [];
		let lst = [];
		while (this.terms.length > 1) {
			const len = this.terms.length;
			for (let x = 0; x < len - 1; x++) {
				const current = this.terms[len - 1 - x];
				for (let y = 0; y < len - 1 - x; y++) {
					const now = this.terms[y];
					const ver = current.compatibile(now);
					if (ver[0]) {
						const el = current.clone();
						current.touched = true;
						now.touched = true;
						el.ignore(ver[1]);
						el.minterms = current.minterms.concat(now.minterms);
						el.dontCare = false;
						if (!el.isPresent(lst)) {
							lst.push(el);
						}
					}
				}
			}
			this.terms.filter(x => !x.touched).forEach(el => {
				newTerms.push(el);
			});
			this.terms = lst;
			lst = [];
		}
		// Reduce ripetition in minterms
		this.terms = newTerms.concat(this.terms);
		this.terms.forEach(t => {
			t.minterms = t.minterms.filter((min, pos) => {
				return t.minterms.indexOf(min) === pos;
			});
		});
		// Build table
		const arr = [];
		this.terms.forEach(t => {
			t.minterms.forEach(n => {
				if (arr[n] === undefined) {
					arr[n] = [t];
				} else {
					arr[n].push(t);
				}
			});
		});
		// Find essential minterms
		const essential = new Set();
		const mints = this.allMinterms.slice(0);
		while (mints[0] !== undefined) {
			let lst = [];
			mints.forEach(n => {
				lst = arr[n].concat(lst);
			});
			const occurrence = lst.map(x => {
				return lst.reduce((a, b) => {
					return a + (b === x);
				}, 0);
			});
			let max = 0;
			for (let x = 1; x < occurrence.length; x++) {
				if (occurrence[max] < occurrence[x]) {
					max = x;
				}
			}
			essential.add(lst[max]);
			lst[max].minterms.forEach(m => {
				mints.splice(mints.indexOf(m), 1);
			});
		}
		this.terms = Array.from(essential);
	};

	this.toString = () => {
		const name = this.name === undefined ? '' : this.name + ' = ';
		if (this.terms.length === 0) {
			return name + 0;
		}
		const str = this.terms.map(x => x.toString()).join(' + ');
		return str === '' ? name + 1 : name + str;
	};

	function Termine(su, num, opts) {
		opts = opts || {};
		const MASKCOMPLETA = (2 ** su.termsSize) - 1;
		this.num = num;
		this.mask = opts.mask || MASKCOMPLETA;
		this.touched = false;
		this.minterms = [];
		this.dontCare = opts.dontCare || false;
		if (!this.dontCare) {
			this.minterms = [num];
		}

		this.ignore = n => {
			this.mask -= 2 ** n;
		};

		this.get = () => {
			return this.num & this.mask;
		};

		this.towMask = mask => {
			return this.get() & mask;
		};

		this.compatibile = t => {
			const pos = Math.log2(t.get() ^ this.get());
			if (t.mask === this.mask && Number.isInteger(pos)) {
				return [true, pos];
			}
			return [false];
		};

		this.clone = () => {
			const opts = {mask: this.mask,
				dontCare: this.dontCare
			};
			const t = new Termine(su, this.num, opts);
			t.minterms = this.minterms;
			return t;
		};

		this.toString = () => {
			let str = '';
			let mask = this.mask;
			let n = num;
			for (let x = 0; x < su.termsSize; x++) {
				if (mask & 1) {
					const alpha = su.alpha[x];
					const concat = n & 1 ? alpha : alpha + '\'';
					str += concat;
				}
				n >>= 1;
				mask >>= 1;
			}
			return str.split('').reverse().join('');
		};

		this.equalsTo = t => {
			return t.toString() === this.toString();
		};

		this.isPresent = arr => {
			for (let x = 0; x < arr.length; x++) {
				if (arr[x].equalsTo(this)) {
					return true;
				}
			}
			return false;
		};

		this.intersection = t => {
			if (this.towMask(t.mask) !== t.towMask(this.mask)) {
				return false;
			}
			const newMask = t.mask & this.mask;
			const newNum = t.get() | this.get();
			return new Termine(su, newNum, newMask);
		};
	}
}

module.exports = CanonicSop;
