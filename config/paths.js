'use strict';

const path = require('path');

const PATHS = {
	public: path.resolve(__dirname, '../public'),
	src: path.resolve(__dirname, '../dist'),
	build: path.resolve(__dirname, '../build'),
};

module.exports = PATHS;
