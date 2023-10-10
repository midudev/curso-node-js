import { createApp } from './app.js'

import { MovieModel } from './models/local-file-system/movie.js'

createApp({ movieModel: MovieModel })
