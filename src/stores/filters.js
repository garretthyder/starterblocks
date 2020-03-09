// Just get current Page Data
export const applyCategoryFilter = (pageData, activeCategory) => {
    let currentPageData = [];
	let tempDataID = [];
    if (activeCategory && pageData[activeCategory] && Array.isArray(pageData[activeCategory]) && pageData[activeCategory].length > 0) {
        pageData[activeCategory].map(value => {
            if (!(tempDataID.indexOf(value.ID) > -1)) {
                    currentPageData.push(value);
                    tempDataID.push(value.ID);
            }
        });
    } else
        for (let key in pageData) {
            Array.isArray(pageData[key]) && pageData[key].map(value => {
                if (!(tempDataID.indexOf(value.ID) > -1)) {
                        currentPageData.push(value);
                        tempDataID.push(value.ID);
                }
                else {
                    if (value.parentID && !(tempDataID.indexOf(value.ID) > -1)) {
                            currentPageData.push(value);
                            tempDataID.push(value.ID);
                    }
                }
            })
		}
    return currentPageData;
};

export const applySearchFilter = (pageData, searchContext) => {
    let newPageData = {};
    Object.keys(pageData).forEach(key => {
        newPageData[key] =  pageData[key].filter(item => item.name.toLowerCase().indexOf(searchContext.toLowerCase()) != -1)
	});
    return newPageData;
}


// Apply Price filter afterwards : Should make sure if it is a best practise to split this filtering
export const applyPriceFilter = (pageData, activePriceFilter) => {
    if (activePriceFilter !== '') {
        let newPageData = {};
        Object.keys(pageData).forEach(key => {
            newPageData[key] =  pageData[key].filter(item => {
                if (activePriceFilter === 'free') return item.pro === false;
                if (activePriceFilter === 'pro') return item.pro === true;
            });
        });
        return newPageData;
    }
    return pageData;
}


// Category to have pro, free count values as well
export const applyPriceCategoryFilter = (categoryData) => {
//    const freeCount = categoryData

}