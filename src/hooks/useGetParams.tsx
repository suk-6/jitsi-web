export const useGetParams = () => {
	const location = window.location;
	const searchParams = new URLSearchParams(location.search);

	const getParams = (param: string) => {
		const res = searchParams.get(param);
		if (!res) {
			throw new Error(`The param ${param} is not found`);
		}
		return res;
	};

	return { getParams };
};
