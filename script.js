// VARIABLES

var current_health = 100
var max_health = 100
var current_overhealth = 0
var max_overhealth = max_health
var current_cells = 100
var max_cells = 100
var selected = "health"

// UTILITY FUNCTIONS

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

// ------------------------------

// Import + Export Shit

// window.onbeforeunload = function(){
//     return "Make sure you export your data before you leave!"
// }

// Function to download data
function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href)
}

// Handles data that is imported
function setImportedValues(dataOBJ) {
    document.getElementById('characterName').value = dataOBJ.name
    document.getElementById('characterAge').value = dataOBJ.age
    document.getElementById('characterAlignment').value = dataOBJ.alignment
    document.getElementById('characterHeight').value = dataOBJ.height
    document.getElementById('characterWeight').value = dataOBJ.weight
    document.getElementById('magicType').value = dataOBJ.magicType
    current_health = dataOBJ.currentHealth
    max_health = dataOBJ.maxHealth
    current_cells = dataOBJ.currentCells
    max_cells = dataOBJ.maxCells

    for (var i = 0; i < dataOBJ.equippedSpells.length; i++) {
        var spellType = dataOBJ.equippedSpells[i][0]
        var spellName = dataOBJ.equippedSpells[i][1]
        var spellInfo = spellList[spellType][spellName]

        var templateSpell = document.querySelector('.template-spell')
        var newSpell = templateSpell.cloneNode(true)

        newSpell.classList.remove('template-spell')
        newSpell.classList.add('active-spell')
        newSpell.querySelector('.spellElementColour').classList.add(spellType)
        newSpell.querySelector('.spellElementColour').title = capitalizeFirstLetter(spellType)
        newSpell.querySelector('.spellElementColour').classList.remove('spellElementColour')
        newSpell.querySelector('.listedSpellName').innerHTML = spellName

        for (const [key, value] of Object.entries(spellInfo)) {
            if (key == "description") {
                newSpell.querySelector('.spellDescription').innerHTML = value
            }
            else {
                var section = document.createElement('div')
                section.classList.add('spellSection')

                var heading = document.createElement('h4')
                heading.innerHTML = capitalizeFirstLetter(key)
                section.appendChild(heading)
                if (key == "cost") {
                    newSpell.querySelector('.confirmCast').style.display = "block"
                }

                var val = document.createElement('p')
                val.innerHTML = value
                val.classList.add('listedSpell' + capitalizeFirstLetter(key))
                section.appendChild(val)

                newSpell.querySelector('.aboutSpell').appendChild(section)
            }
        }

        document.querySelector('.spellHolder').appendChild(newSpell)
    }

    colourSpells()
    checkSpellCasting()
    updateBars('health')
    updateBars('cells')

}

// Import data
function saveImport(importItem) {
    var importedFile = importItem.files[0];

    var reader = new FileReader();
    reader.onload = function () {
        var fileContent = JSON.parse(reader.result);

        setImportedValues(fileContent)
        // Do something with fileContent
        // document.getElementById('json-file').innerHTML = fileContent;  
    };
    reader.readAsText(importedFile);
}

// Convert data into an object then pass it to download()
function exportData() {
    var obj = {
        "name": document.getElementById('characterName').value,
        "age": parseInt(document.getElementById('characterAge').value,),
        "alignment": document.getElementById('characterAlignment').value,
        "height": document.getElementById('characterHeight').value,
        "weight": parseInt(document.getElementById('characterWeight').value),
        "magicType": document.getElementById('magicType').value,
        "maxHealth": max_health,
        "currentHealth": current_health,
        "maxCells": max_cells,
        "currentCells": current_cells,
        "equippedSpells": []
    }

    var spells = document.querySelectorAll('.active-spell')
    for (var i = 0; i < spells.length; i++) {
        var temp_list = []
        var spell = spells[i]

        temp_list.push(spell.children[0].title.toLowerCase())
        temp_list.push(spell.querySelector('.listedSpellName').innerHTML)
        obj.equippedSpells.push(temp_list)
    }

    var filename = document.getElementById('characterName').value.toLowerCase().replaceAll(' ', '_')

    download(JSON.stringify(obj), filename + ".json", 'text/plain')
}

// ------------------------------

// Health and Cell Bar Handling

function updateBars(bar) {
    if (bar == "health"){
        var percent = (current_health / max_health) * 100
        var overhealthPercent = (current_overhealth / max_overhealth) * 100
        if (percent >= 70) {
            document.querySelector('#health-bar').style.backgroundColor = '#6edb64'
        }
        else if (percent >= 30) {
            document.querySelector('#health-bar').style.backgroundColor = '#cca143'
        }
        else if (percent >= 10) {
            document.querySelector('#health-bar').style.backgroundColor = '#cc4343'
        }
        else {
            document.querySelector('#health-bar').style.backgroundColor = '#661b1b'
        }
        document.querySelector('#health-bar').style.width = percent.toString() + "%"
        document.querySelector('#overhealth-bar').style.width = overhealthPercent.toString() + "%"
        document.querySelector('#health-numbers').innerHTML = (current_health + current_overhealth).toString() + " / " + max_health.toString()
    }
    else {
        var percent = (current_cells / max_cells) * 100
        if (percent >= 80) {
            document.querySelector('#cell-bar').style.backgroundColor = '#59dfd8'
        }
        else if (percent >= 60) {
            document.querySelector('#cell-bar').style.backgroundColor = '#48c7c8'
        }
        else if (percent >= 40) {
            document.querySelector('#cell-bar').style.backgroundColor = '#3bb0b8'
        }
        else if (percent >= 40) {
            document.querySelector('#cell-bar').style.backgroundColor = '#3198a5'
        }
        else {
            document.querySelector('#cell-bar').style.backgroundColor = '#2a8292'
        }
        document.querySelector('#cell-bar').style.width = percent.toString() + "%"
        document.querySelector('#cell-numbers').innerHTML = current_cells.toString() + " / " + max_cells.toString()
    }
}

function calculateBars(bar, value) {
    if (bar == "health") {
        var overhealthOn = document.querySelector('#overhealthEnabled').checked

        if (overhealthOn) {
            // If overhealth is enabled
            if (value > 0) {
                // If we're adding HP
                if (current_health < max_health) {
                    // If main health needs restoring
                    var healthNeeded = max_health - current_health
                    if (value > healthNeeded) {
                        var extraHealth = value - healthNeeded
                        current_health = max_health
                        current_overhealth = extraHealth
                    }
                    else {
                        current_health += value
                    }
                }
                else {
                    // If we're already at max hp or are in overhealth
                    current_overhealth += value
                    if (current_overhealth > max_overhealth) {
                        current_overhealth = max_overhealth
                    }
                }
            }
            else {
                // If we're subtracting HP
                value = Math.abs(value)
                if (current_overhealth > 0) {
                    if (current_overhealth > value) {
                        current_overhealth -= value
                    }
                    else {
                        var remainingValue = value - current_overhealth
                        current_overhealth = 0
                        current_health -= remainingValue
                    }
                }
                else {
                    current_health -= value
                }
            }
        }
        else {
            // If overhealth isn't enabled
            if (value > 0) {
                // If we're adding HP
                if (current_overhealth > 0) {
                    return
                }
                else {
                    if (current_health + value > max_health) {
                        current_health = max_health
                    }
                    else {
                        current_health += value
                    }
                }
            }
            else {
                // If we're subtracting HP
                value = Math.abs(value)
                if (current_overhealth > 0) {
                    if (current_overhealth > value) {
                        current_overhealth -= value
                    }
                    else {
                        var remainingValue = value - current_overhealth
                        current_overhealth = 0
                        current_health -= remainingValue
                    }
                }
                else {
                    current_health -= value
                }
            }
        }

        if (current_health < 0) {
            current_health = 0
        }

        console.log(current_health, max_health, current_overhealth)
    }
    else {
        current_cells = current_cells + value
        if (current_cells > max_cells) {
            current_cells = max_cells
        }
        if (current_cells < 0) {
            current_cells = 0
        }
        checkSpellCasting()
    }
}

function barSelected(button) {
    if (button.id == "healthSelectionButton") {
        selected = "health"
        button.style.color = "#ffffff"
        button.style.backgroundColor = '#46a552'
        button.style.cursor = "initial"
        document.querySelector('#cellSelectionButton').style.color = '#000000'
        document.querySelector('#cellSelectionButton').style.backgroundColor = '#ffffff'
        document.querySelector('#cellSelectionButton').style.cursor = "pointer"
    }
    else {
        selected = "cells"
        button.style.color = "#ffffff"
        button.style.backgroundColor = '#4f99bb'
        button.style.cursor = "initial"
        document.querySelector('#healthSelectionButton').style.color = '#000000'
        document.querySelector('#healthSelectionButton').style.backgroundColor = '#ffffff'
        document.querySelector('#healthSelectionButton').style.cursor = "pointer"
    }
}

function addSub(button){
    if (button.id == "addBars") {
        calculateBars(selected, parseInt(document.querySelector('.barsInput').value))
        updateBars(selected)
    }
    else {
        calculateBars(selected, -parseInt(document.querySelector('.barsInput').value))
        updateBars(selected)
    }

    document.querySelector('.barsInput').value = 0
}

// ------------------------------

// Spell Handling

function checkSpellCasting() {
    var spells = document.querySelectorAll('.active-spell')

    for (var i = 0; i < spells.length; i++) {
        var spell = spells[i]

        if (spell.querySelector('.confirmCast').style.display != 'block') {
            continue;
        }

        var cost = parseInt(spell.querySelector('.listedSpellCost').innerHTML)

        if (cost > current_cells) {
            spell.querySelector('.confirmCast').disabled = true
        }
        else {
            spell.querySelector('.confirmCast').disabled = false
        }
    }

}

function colourSpells() {
    var spells = document.querySelectorAll('.active-spell')

    for (var i = 0; i < spells.length; i++) {
        if (i % 2 == 0) {
            spells[i].style.backgroundColor = '#f1f1f1'
        }
        else {
            spells[i].style.backgroundColor = '#cecece'
        }
    }
}

function changeSpellList(magicList) {
    var magicType = magicList.value

    var spells = Object.keys(spellList[magicType])

    var spellNameMenu = document.getElementById('spellName')
    for (item in spellNameMenu.options) {
        spellNameMenu.options.remove(0)
    }


    for (var i = 0; i < spells.length; i++) {
        var option = document.createElement("option")
        option.value = i
        option.text = spells[i]
        spellNameMenu.appendChild(option)
    }
}

function addSpell() {
    var spellType = document.getElementById('spellType').value
    var spellName = Object.keys(spellList[spellType])[document.getElementById('spellName').value]
    var spellInfo = spellList[spellType][spellName]

    var templateSpell = document.querySelector('.template-spell')
    var newSpell = templateSpell.cloneNode(true)

    newSpell.classList.remove('template-spell')
    newSpell.classList.add('active-spell')
    newSpell.querySelector('.spellElementColour').classList.add(spellType)
    newSpell.querySelector('.spellElementColour').title = capitalizeFirstLetter(spellType)
    newSpell.querySelector('.spellElementColour').classList.remove('spellElementColour')
    newSpell.querySelector('.listedSpellName').innerHTML = spellName

    for (const [key, value] of Object.entries(spellInfo)) {
        if (key == "description") {
            newSpell.querySelector('.spellDescription').innerHTML = value
        }
        else {
            var section = document.createElement('div')
            section.classList.add('spellSection')

            var heading = document.createElement('h4')
            heading.innerHTML = capitalizeFirstLetter(key)
            section.appendChild(heading)
            if (key == "cost") {
                newSpell.querySelector('.confirmCast').style.display = "block"
            }

            var val = document.createElement('p')
            val.innerHTML = value
            val.classList.add('listedSpell' + capitalizeFirstLetter(key))
            section.appendChild(val)

            newSpell.querySelector('.aboutSpell').appendChild(section)
        }
    }

    document.querySelector('.spellHolder').appendChild(newSpell)
    colourSpells()
    checkSpellCasting()
}

function removeSpell(spell) {
    spell.parentElement.parentElement.parentElement.remove()
    colourSpells()
}

function castSpell(spell) {
    var cost = -parseInt(spell.parentElement.parentElement.querySelector('.listedSpellCost').innerHTML)

    calculateBars('cells', cost)
    updateBars('cells')
}