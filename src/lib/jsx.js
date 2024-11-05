const convertToJS = (code) => {
  // return Babel.transform(code, { presets: ['env'] }).code;
  return code;
};

const superscript = document.querySelectorAll('script[type="JSX"]');
superscript.forEach(async (script) => {
  let js;
  if (script.innerText) {
    js = convertToJS(script.innerText);
  } else {
    const response = await fetch(script.src);
    const srcCode = await response.text();
    js = convertToJS(srcCode);
  }
  const scriptTag = document.createElement('script');
  scriptTag.type = 'module';
  scriptTag.innerHTML = js;
  document.body.appendChild(scriptTag);
});
