(() => {
	window.addEventListener('DOMContentLoaded', async () => {
		const webcamEl = document.getElementById('webcam')
		const consoleEl = document.getElementById('console')

		const setupWebcam = async () => new Promise((resolve, reject) => {
			const constraints = { video: true, audio: false }
			if (navigator.mediaDevices.getUserMedia) {
				navigator.mediaDevices.getUserMedia(constraints)
					.then(stream => {
						webcamEl.srcObject = stream
						resolve()
					})
					.catch(reject)
			} else {
				const navigatorAny = navigator
				navigator.getUserMedia = navigator.getUserMedia ||
					navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
					navigatorAny.msGetUserMedia
				if (navigator.getUserMedia) {
					navigator.getUserMedia({video: true},
						stream => {
							webcamEl.srcObject = stream
							webcamEl.addEventListener('loadeddata',  () => resolve(), false)
						},
						error => reject(error))
				} else {
					reject()
				}
			}
		})

		await setupWebcam()
		const net = await mobilenet.load()
		window.setInterval(async () => {
			const predictions = await net.classify(webcamEl)

			consoleEl.innerText = predictions.map(prediction => {
				const { className, probability } = prediction
				const percentAccuracy = Math.floor(probability * 1000.0) / 10.0

				return `${className} (${percentAccuracy}%)`
			}).join('\n')

			await tf.nextFrame()
		}, 250)
	})
})()