import Document, {
	Html,
	Head,
	Main,
	NextScript,
	DocumentContext,
} from "next/document";

class MyDocument extends Document {
	static async getInitialProps(ctx: DocumentContext) {
		const initialProps = await Document.getInitialProps(ctx);
		return { ...initialProps };
	}

	render() {
		return (
			<Html>
				<Head>
					<title>Clics</title>
					<link rel="icon" type="image/svg+xml" href="/clics-b.svg" />
					<meta property="og:site_name" content="clics" />
					<meta property="og:type" content="website" />
					<meta
						property="og:url"
						content={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/`}
					/>
					<meta
						property="og:image"
						content={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/clics.svg`}
					/>
					<meta
						property="twitter:image"
						content={`${process.env.NEXT_PUBLIC_CLIENT_BASE_URL}/clics.svg`}
					/>
					<meta property="twitter:site" content="@clics" />
					<meta property="twitter:card" content="summary" />
					<link rel="preconnect" href="https://fonts.gstatic.com" />
					<link
						href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@100;200;300;400;500;600&display=swap"
						rel="stylesheet"
					/>
					<link rel="stylesheet" href="/all.min.css" />
				</Head>
				<body
					className="font-body"
					style={{ backgroundColor: "#DAE0E6" }}
				>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}

export default MyDocument;
