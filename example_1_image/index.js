(async () => {
	const imgEl = document.getElementById('img')
	const consoleEl = document.getElementById('console')

	const net = await mobilenet.load({ version: 2, alpha: 1.0 })
	const predictions = await net.classify(imgEl)

	consoleEl.innerText = predictions.map(prediction => {
		const { className, probability } = prediction
		const percentAccuracy = Math.floor(probability * 1000.0) / 10.0

		return `${className} (${percentAccuracy}%)`
	}).join('\n')
})()