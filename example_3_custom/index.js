(() => {
	window.addEventListener('DOMContentLoaded', async () => {
		const webcamEl = document.getElementById('webcam')
		const predictionEl = document.getElementById('prediction')
		const guessesEl = document.getElementById('guesses')
		const thing1El = document.getElementById('thing-1')
		const thing2El = document.getElementById('thing-2')
		const thing3El = document.getElementById('thing-3')
		const thing4El = document.getElementById('thing-4')

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
		const classifier = knnClassifier.create()

		const addExample = classId => {
			const activation = net.infer(webcamEl, 'conv_preds')
			classifier.addExample(activation, classId)
		}

		thing1El.addEventListener('click', () => addExample('thing-1'))
		thing2El.addEventListener('click', () => addExample('thing-2'))
		thing3El.addEventListener('click', () => addExample('thing-3'))
		thing4El.addEventListener('click', () => addExample(null))

		window.setInterval(async () => {
			if (classifier.getNumClasses() > 0) {
				const activation = net.infer(webcamEl, 'conv_preds')
				const { label, confidences } = await classifier.predictClass(activation)

				predictionEl.innerText = label
				guessesEl.innerText = Object.keys(confidences).map(guessedLabel => {
					const probability = confidences[guessedLabel]
					const percentAccuracy = Math.floor(probability * 1000.0) / 10.0

					return `${guessedLabel} (${percentAccuracy}%)`
				}).join('\n')
			}
			await tf.nextFrame()
		}, 250)
	})
})()