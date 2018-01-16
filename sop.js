function CanonicSop(size) {
	this.terms = [];
	this.minterms = [];
	this.termsSize = size;
	this.alpha = ['x', 'y', 'z', 's', 't', 'v'];

	this.push = num => {
		const term = new Termine(this, num);
		this.terms.push(term);
		this.minterms.push(term);
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
					arr[n] = 1;
				} else {
					arr[n]++;
				}
			});
		});
	};

	this.toString = () => {
		return this.terms.map(x => x.toString()).join(' + ');
	};

	function Termine(su, num, opts) {
		opts = opts || {};
		const MASKCOMPLETA = (2 ** su.termsSize) - 1;
		this.num = num;
		this.mask = opts.mask || MASKCOMPLETA;
		this.touched = false;
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
					const concat = n & 1 ? alpha : '\'' + alpha;
					str += concat;
				}
				n >>= 1;
				mask >>= 1;
			}
			return str;
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

const sop = new CanonicSop(4);
sop.push(1);
sop.push(3);
sop.push(6);
sop.push(7);
sop.push(15);
sop.push(14);
sop.push(9);
sop.push(8);
sop.push(10);
sop.min();
console.log(sop.toString());
