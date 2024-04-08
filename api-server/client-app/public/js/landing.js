function addTarget() {
    let targetNumber = document.getElementsByClassName("target-container").length + 1;
    fetch('/html/target-string-form.html')
        .then(response => response.text())
        .then(html => {

            html = html.replaceAll("==target_number==", `${targetNumber}`);
            let htmlElement = fromHTML(html);
            document.getElementById('target-string-container').appendChild(htmlElement);
        });
}

function compare() {
    let sourceString = document.getElementById('source-string').value;
    let targetContainers = document.getElementsByClassName('target-container');
    let targetStrings = [];
    for (let i = 0; i < targetContainers.length; i++) {
        targetStrings[i] = targetContainers[i].getElementsByTagName('input')[0].value;
    }
    let json = {
        sourceStr: sourceString,
        targetStr: []
    }
    targetStrings.map(item => {
        json.targetStr.push(item);
    })
    fetch('/compare', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        credentials: "same-origin", // include, *same-origin, omit
        body: JSON.stringify(json)
    })
        .then(r => r.json())
        .then(json => {
            console.log(json);
        })
}

function fromHTML(html, trim = true) {
    // Process the HTML string.
    html = trim ? html.trim() : html;
    if (!html) return null;

    // Then set up a new template element.
    const template = document.createElement('template');
    template.innerHTML = html;
    const result = template.content.children;

    // Then return either an HTMLElement or HTMLCollection,
    // based on whether the input HTML had one or more roots.
    if (result.length === 1) return result[0];
    return result;
}