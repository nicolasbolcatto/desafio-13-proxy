function randomCalculation(msg){
    const cant = msg || 100000000
    let numbers = []
    let count = 0
    while (count <= cant) {
        const number = Math.floor(Math.random() * 1000 + 1)
        numbers.push(number)
        count++
    }

    let countObject = numbers.reduce(function(
        randomCount,
        currentValue
    ) {
        return (
            randomCount[currentValue] ? ++randomCount[currentValue] : (randomCount[currentValue] = 1),
            randomCount
        );
    }, {});

    return countObject
}


process.on("exit", () => {
    console.log("Hilo terminado: " + process.pid)
})

process.on("message", msg => {
    console.log("Hilo iniciado: " + process.pid)
    const result = randomCalculation(msg)
    process.send(result)
    process.exit()
})

process.send("Listo")