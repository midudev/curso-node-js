import { createApp } from './app.js'

import { MovieModel } from './models/mysql/movie.js'

createApp({ movieModel: MovieModel })
