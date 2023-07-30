let paginationElement
let currentPageDisplayed
init()
let loadedPlanets
let planetsCount
const rowsPerPage = 10


function init() {
    document.querySelector("#residentsModal").addEventListener(`show.bs.modal`, fillResidentsModal)
    document.querySelector("#residentsModal").addEventListener(`hidden.bs.modal`, e => {
        document.querySelector("#residentsData tbody").innerHTML = ""
    })
    paginationElement = document.querySelector("#paginationList")
    createTable(1)
}

async function fillResidentsModal(event) {
    console.log("otwieram modal")
    console.log(loadedPlanets)
    console.log(event.relatedTarget)
    console.log(event.relatedTarget.getAttribute("data-bs-planet"))
    const planetName = event.relatedTarget.getAttribute("data-bs-planet")
    const chosenPlanet = loadedPlanets.find(planet => planet.name === planetName)
    const residentsUrls = chosenPlanet.residents
    const modalTableBody = document.querySelector("#residentsData tbody")

    const numberOfResidents = residentsUrls.length
    const stepByResident = 100 / numberOfResidents
    const progressBarElement = document.querySelector("#progressModal")
    const progressElement = document.querySelector("#progressContainer")

    progressBarElement.style.display = 'block'

    for (const residentsUrl of residentsUrls) {
        await fetchTableData(residentsUrl, modalTableBody, progressBarElement, progressElement, stepByResident);
    }
    progressBarElement.style.width = "0%"
    progressBarElement.style.display = 'none'

    console.log(residentsUrls)

}

async function fetchTableData(residentsUrl, modalTableBody, progressBarElement, currentProgress, stepByResident) {
    await fetch(residentsUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const row = `
                        <tr>
                            <td>${data.name}</td>
                            <td>${data.height}</td>
                            <td>${data.mass}</td>
                            <td>${data.hair_color}</td>
                            <td>${data.skin_color}</td>
                            <td>${data.eye_color}</td>
                            <td>${data.birth_year}</td>
                            <td>${data.gender}</td>
                        </tr>`
            modalTableBody.innerHTML += row

            let currentProgress = Number.parseFloat(progressBarElement.style.width.replace("%", ""))
            progressBarElement.style.width = currentProgress + stepByResident + "%"
        })
}


function createTable(page) {
    const tableBodyElement = document.querySelector("#planetData tbody")
    getPlanetData(page).then(planets => {
        let residentsContent = ""
        let planetsCount = planets.count
        console.log("Planet Count: " + planets.count)

        updatePagination(planetsCount, page)
        tableBodyElement.innerHTML = ""
        planets.results.forEach(planet => {

            if (planet.residents.length !== 0) {
                residentsContent = `<button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#residentsModal" data-bs-planet="${planet.name}">${planet.residents.length} resident(s)</button>`
            } else {
                residentsContent = "No known residents"
            }

            const rowHtml = `
            <tr>
                <td>${planet.name}</td>
                <td>${planet.diameter}</td>
                <td>${planet.climate}</td>
                <td>${planet.terrain}</td>
                <td>${planet.surface_water}</td>
                <td>${planet.population}</td>
                <td>${residentsContent}</td>
                <td><button class="btn btn-primary">Vote</button></td>
            </tr>`
            tableBodyElement.innerHTML += rowHtml
        })
        loadedPlanets = planets.results
        console.log(planets)
        console.log(planets.count)
        console.log(planets.results)
        console.log(planets.next)
        console.log(planets.results[1])
    })
}

async function getPlanetData(page) {
    const endpointToCol = `https://swapi.dev/api/planets/?page=${page === undefined ? 1 : page}`
    return await fetch(endpointToCol)
        .then(response => response.json())
}

function updatePagination(planetCount, currentPage) {
    const numberOfPages = Math.ceil(planetCount / rowsPerPage)
    //active
    //disabled
    // N P -> disabled / not disabled

    paginationElement.innerHTML = ""
    paginationElement.innerHTML += `<li class="page-item ${currentPage === 1 ? "disabled" : ""}" ><a class="page-link" href="#" id="prev">Previous</a></li>`
    for (let i = 1; i <= numberOfPages; i++) {
        paginationElement.innerHTML += `<li class="page-item ${i === currentPage ? "active" : ""}"><a data-bs-pno="${i}" class="page-link" href="#">${i}</a></li>`
    }
    paginationElement.innerHTML += `<li class="page-item ${currentPage === numberOfPages ? "disabled" : ""}"><a class="page-link" href="#" id="next">Next</a></li>`

    Array.from(paginationElement.children)
        .filter(li => !(li.classList.contains("disabled") || li.classList.contains("active")))
        .forEach(li => li.addEventListener("click", switchPage))

    currentPageDisplayed = currentPage
}

function switchPage(event) {
    console.log("switchPage from " + currentPageDisplayed)
    // console.log(event.target)

    let newPageNumber

    if(event.target.id === 'prev') {
        newPageNumber = currentPageDisplayed - 1
    } else if (event.target.id === 'next') {
        newPageNumber = currentPageDisplayed + 1
    } else {
        newPageNumber = Number.parseInt(event.target.getAttribute("data-bs-pno"))
    }

    createTable(newPageNumber)
    console.log("New page number will be: " + newPageNumber)

}
