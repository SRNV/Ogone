/**
 * this class will compare two line
 * and return the two lines are pretty much similar
 */
export default class LineCompare {
  static threshold: number = 0.555
  static compare(l1: string, l2: string): boolean {
    const line1 = l1.trim();
    const line2 = l2.trim();
    // coeff 1
    const tests: boolean[] = [
      // the two lines are equal
      line1 === line2,
      // only one letter is missing at the end or the beginning
      line1.slice(-1) === line2,
      line1.slice(1) === line2,
      // the first line ends with the second
      line1.endsWith(line2),
      // the first line starts with the second
      line1.startsWith(line2),
      // the second line ends with the firts
      line2.endsWith(line1),
      // the second line starts with the first
      line2.startsWith(line1),
      // same number of letters
      line1.length === line2.length,
    ];
    // coeff 5
    const testsSimilarity = [
      // looks like
      this.looksMaybeLike(line1, line2),
      this.looksMaybeLike(line2, line1),
      this.looksLike(line1, line2),
      this.looksLike(line2, line1),
    ];
    const resultNormalTests = (tests.filter((test) => test).length / tests.length);
    const resultNormalTestsSimilarity = (testsSimilarity.filter((test) => test).length / testsSimilarity.length) * 5;
    const result = (resultNormalTests + resultNormalTestsSimilarity ) / 6 > LineCompare.threshold;
    console.log('result', (resultNormalTests + resultNormalTestsSimilarity ) / 6)
    return tests[0] || result;
  }
  static looksLike(l1: string, l2: string): boolean {
    let result = false;
    const line2: string[] = l2.split('');
    const line1 = l1;
    line2.forEach((char: string, id: number) => {
      if (line1[id] === char) {
        delete line2[id];
      }
    });
    result = (line2.filter((char) => char).length / line2.length) < (1 - LineCompare.threshold);
    return result;
  }
  static looksMaybeLike(l1: string, l2: string): boolean {
    let result = false;
    const candidate: string[] = l1.split('');
    const source = l2.split('');
    let cursor = 0;
    const missingParts: string[] = [];
    candidate.forEach((char: string,) => {
      if (source[cursor] === char) {
        cursor++;
      } else if (char.trim().length) {
        missingParts.push(char);
      }
    });
    console.warn('maybe', missingParts, l1, l2, cursor, l1.length)
    result = cursor / l1.length > LineCompare.threshold || l1.replace(missingParts.join(''), '') === l2;
    return result;
  }
}

const test1 = LineCompare.compare('this is a test', 'should fail');
const test2 = LineCompare.compare('this is a second test', 'this is a second test');
const test3 = LineCompare.compare('this is a test', 'this is a tes');
const test4 = LineCompare.compare('  inherit test', ' inherit test');
console.log(test1, test2, test3, test4);