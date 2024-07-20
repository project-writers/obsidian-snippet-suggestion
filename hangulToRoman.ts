import Hangul from "hangul-js";

const isKorean = (char: string): boolean => {
	const code = char[0].charCodeAt(0);
	return (
		(code >= 0xac00 && code <= 0xd7a3) || // 현대 한글 음절
		(code >= 0x1100 && code <= 0x11ff) || // 옛 한글 자모 (초성, 중성, 종성)
		(code >= 0x3130 && code <= 0x318f) || // 한글 호환 자모
		(code >= 0xa960 && code <= 0xa97f) || // 한글 자모 확장-A
		(code >= 0xd7b0 && code <= 0xd7ff) // 한글 자모 확장-B
	);
};
const hangul2roman = (str: string) => {
	if (!isKorean(str)) return str;

	const KEYs = {
		ㅃ: "Q",
		ㅉ: "W",
		ㄸ: "E",
		ㄲ: "R",
		ㅆ: "T",
		ㅒ: "O",
		ㅖ: "P",
		ㅂ: "q",
		ㅈ: "w",
		ㄷ: "e",
		ㄱ: "r",
		ㅅ: "t",
		ㅛ: "y",
		ㅕ: "u",
		ㅑ: "i",
		ㅐ: "o",
		ㅔ: "p",
		ㅁ: "a",
		ㄴ: "s",
		ㅇ: "d",
		ㄹ: "f",
		ㅎ: "g",
		ㅗ: "h",
		ㅓ: "j",
		ㅏ: "k",
		ㅣ: "l",
		ㅋ: "z",
		ㅌ: "x",
		ㅊ: "c",
		ㅍ: "v",
		ㅠ: "b",
		ㅜ: "n",
		ㅡ: "m",
		ㄳ: "rt",
		ㅄ: "qt",
		ㄼ: "fq",
		ㄺ: "fr",
		ㄻ: "fa",
		ㅀ: "fg",
		ㄾ: "fx",
		ㄿ: "fv",
	};
	const convertKorToEng = (key: string) => {
		const korean = /[ㄱ-ㅎ|ㅏ-ㅣ]/;
		if (korean.test(key)) return KEYs[key];
		return key;
	};

	const disassemble = Hangul.disassemble(str);
	const roman = disassemble.map((c) => convertKorToEng(c));
	return roman.join("");
};

console.log(hangul2roman("/한글"));
console.log(hangul2roman("/ㄱㄷㅇ"));
console.log(hangul2roman("/ㅠㅣ뎌"));
console.log(hangul2roman("/ㅎㄱㄷ두"));
console.log(isKorean("/ㄱa"));
