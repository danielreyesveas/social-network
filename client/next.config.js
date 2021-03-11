module.exports = {
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			issuer: {
				test: /\.(js|ts)x?$/,
			},
			use: ["@svgr/webpack"],
		});

		return config;
	},
	images: {
		domains: process.env.NEXT_PUBLIC_IMAGES_DOMAINS.split(","),
	},
};
