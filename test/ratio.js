function gcd (a, b) {
    return (b == 0) ? a : gcd (b, a%b);
}
// 1755 × 1242
var w = 1755;
var h = 1755;
var r = gcd (w, h);

console.log("Dimensions = ", w, " x ", h);
console.log('Gcd', r);
console.log("Aspect     = ", w/r, ":", h/r);