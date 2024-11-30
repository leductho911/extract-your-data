(() => {
    const regex = /C\d{2,4}/g; // Matches "Cxx", "Cxxx", or "Cxxxx"
    const matches = [...document.body.innerText.matchAll(regex)];
    return matches.map(match => match[0]);
})();