"use strict";
let myTextarea = document.getElementById("textarea");
//@ts-ignore
myTextarea.value = "This is some text.";
const myButton = document.getElementById('myButton');
//@ts-ignore
myButton.addEventListener('click', () => {
    //@ts-ignore
    const inputValue = myTextarea.value;
    console.log(`The input value is: ${inputValue}`);
});
//# sourceMappingURL=start.js.map