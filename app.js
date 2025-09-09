const axios = require("axios");
const fs = require("fs");
const { Parser } = require("json2csv");

async function getDiscover(pageNumber = 1) {
    try {
        const limit = 5; // limit feeds dalam page
        const offset = (pageNumber - 1) * limit;

        const url = `https://shopee.co.id/api/v4/homepage/get_daily_discover?bundle=daily_discover_main&item_card=2&limit=${limit}&need_tab=false&offset=${offset}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
                "Accept": "application/json, text/plain, */*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
                "Accept-Language": "en-US,en;q=0.9",
                "Referer": `https://shopee.co.id/daily_discover?pageNumber=${pageNumber}`,
                "x-api-source": "pc",
                "x-requested-with": "XMLHttpRequest",
                "x-shopee-language": "en",
                "cookie": "SPC_ST=.bXpac3RPenR5d2pES0lXYRWBYMFkGd4X+NqwXk+jPckqRSw7GNAUZBCiFjs2fYTLUvrFrOl23eQWjezUnark1V9w2Xqzx1xn3n6rc+BGMLKP/s6Fu9rmdVOHY2hnTk2/pUSOoH933b6CYvDhRme4cJWlSqcingivYHBi+61CLq4CtkXNdL0XgeVVqshPNJjbxDT0AhzHw6z7dByoZ90aBCB0g2fLSbK2Kul689NHFB1dp4Pw2UrQHnbQjZpBH8uTbBcadodydAz4cAP7HYS83g==; SPC_U=841966690; SPC_EC=.SUptcXpJWm00SVFFc0Nkcf+vkijoQhvQe7vlGoYgNWyT3or15QXSrj1HaespZwQjP9RjX/NQHf30SeXa6pqJQP07opP0zNFj6y5Sa71VCP1CSqj5YEoumwJju9yeNu8Qog/9Xyy57HGb6fUsOGmHlDMOnAixZDkDL8USwqgOXMtYqVntE4Lx2cqV5F02Y6BFJlVb9hy5LMVpYnBHF+1aNJph6tcV0muVQuFRUAsxoiNUiFArq/wYP5X3T0Etl/gho4iotwgmnT5mR1uV+IuwIw==; SPC_R_T_ID=8agSFfDawziOLQy5qWMGpi6wzQ8XrbIp097tWlnEMEA8PXuzH6ExcIHhI9+NM7NTZ2kcfKgnMZpWRlvYziIli0CS6NXj952MZ8P0TORRkDCuqzL6046S1lRZU4Bj+PYcHAakzhlsHbpr9dIEXDYT/JZnzrN8aOQov/OGzkzX9jU=; SPC_R_T_IV=aGp6ZHd6dGdMajdlNUpTeQ==; SPC_T_ID=8agSFfDawziOLQy5qWMGpi6wzQ8XrbIp097tWlnEMEA8PXuzH6ExcIHhI9+NM7NTZ2kcfKgnMZpWRlvYziIli0CS6NXj952MZ8P0TORRkDCuqzL6046S1lRZU4Bj+PYcHAakzhlsHbpr9dIEXDYT/JZnzrN8aOQov/OGzkzX9jU=; SPC_T_IV=aGp6ZHd6dGdMajdlNUpTeQ==; SPC_SI=XBabaAAAAAAyNzZSaDZzWZ2nLgYAAAAANG1ZTkh2TUk="
            },
        });

        if (data && data.data && data.data.feeds) {
            console.log(`✅ Page ${pageNumber} - Found ${data.data.feeds.length} items`);
            return data.data.feeds;
        } else {
            console.log("⚠️ No feeds found:", data);
            return [];
        }
    } catch (err) {
        console.error(`❌ Request failed for page ${pageNumber}:`, err.message);
        return [];
    }
}

// async function scrapeMultiple(pages = 5) {
//     let allFeeds = [];

//     for (let i = 1; i <= pages; i++) {
//         const feeds = await getDiscover(i);
//         allFeeds = allFeeds.concat(feeds);
//     }

//     console.log("\n===============================");
//     // console.log('allFeeds:', allFeeds)
//     console.log(`🎉 Total feeds scraped: ${allFeeds.length}`);
//     console.log("===============================\n");

//     allFeeds.forEach((feed, idx) => {
//         if (feed.type === "item_card" && feed.item_card) {
//             console.log(`\n🛒 Item card ${idx + 1}:`);
//             console.dir(feed.item_card, { depth: null });
//         }
//     });
// }

// const TOTAL_PAGES = 1;  
// scrapeMultiple(TOTAL_PAGES);

// async function scrapeMultiple(pages = 1) {
//     let allItems = [];

//     for (let i = 1; i <= pages; i++) {
//         const feeds = await getDiscover(i);

//         feeds.forEach(feed => {
//             if (feed.type === "item_card" && feed.item_card?.item) {
//                 const item = feed.item_card.item;

//                 const clean = {
//                     product_info: {
//                         item_name: item.name,
//                         item_stock: item.stock,
//                         item_sold: item.sold,
//                         item_sold_history: item.historical_sold,
//                         item_liked: item.liked_count,
//                         item_images: item.images?.map(img => `https://down-id.img.susercontent.com/file/${img}`),
//                         estimated_delivery_time: item.estimated_delivery_time.estimated_delivery_time_text || null,
//                         is_sold_out: item.item_card_display_price.is_sold_out,
//                         is_on_flash_sale: item.is_on_flash_sale
//                     },
//                     price_info: {
//                         price: item.price / 100000, 
//                         original_price: item.item_card_display_price.original_price / 100000,
//                         strikethrough_price: item.item_card_display_price.strikethrough_price,
//                         hidden_price_display: item.hidden_price_display,
//                         is_live_streaming_price: item.is_live_streaming_price,
//                     },
//                     discount_info: {
//                         total_discount: item.discount,
//                         raw_discount: item.raw_discount,
//                         discount_text: item.item_card_display_price.discount_text
//                     },
//                     rating_info: {
//                         rating_star: item.item_rating?.rating_star,
//                         rating_total: item.item_rating?.rating_count?.[0] || 0,
//                         rating_breakdown: {
//                             1: item.item_rating?.rating_count?.[1],
//                             2: item.item_rating?.rating_count?.[2],
//                             3: item.item_rating?.rating_count?.[3],
//                             4: item.item_rating?.rating_count?.[4],
//                             5: item.item_rating?.rating_count?.[5],
//                         },
//                     },
//                     shop_info: {
//                         shop_name: item.shop_name,
//                         shop_location: item.shop_location,
//                         shopee_verified: item.shopee_verified,
//                         preferred_plus: item.is_preferred_plus_seller,
//                         is_service_by_shopee: item.is_service_by_shopee,
//                         is_official_shop: item.is_official_shop,
//                     },
//                     voucher: item.voucher_info,
//                 };

//                 allItems.push(clean);
//                 console.log(clean);
//             }
//         });
//     }

//     console.log(`\n🎉 Total items scraped: ${allItems.length}`);
// }

async function scrapeMultiple(pages = 1) {
    let allItems = [];

    for (let i = 1; i <= pages; i++) {
        const feeds = await getDiscover(i);

        feeds.forEach(feed => {
            if (feed.item_card?.item) {
                const item = feed.item_card.item;

                const clean = {
                    item_name: item.name,
                    item_stock: item.stock,
                    item_sold: item.sold,
                    item_sold_history: item.historical_sold,
                    item_liked: item.liked_count,
                    estimated_delivery_time: item.estimated_delivery_time?.estimated_delivery_time_text || null,
                    is_sold_out: item.item_card_display_price?.is_sold_out,
                    is_on_flash_sale: item.is_on_flash_sale,
                    price: item.price / 100000,
                    original_price: item.item_card_display_price?.original_price ,
                    strikethrough_price: item.item_card_display_price?.strikethrough_price / 100000,
                    hidden_price_display: item.hidden_price_display,
                    is_live_streaming_price: item.is_live_streaming_price,
                    discount_total: item.discount,
                    discount_raw: item.raw_discount,
                    discount_text: item.item_card_display_price?.discount_text,
                    rating_star: item.item_rating?.rating_star,
                    rating_total: item.item_rating?.rating_count?.[0] || 0,
                    rating_1: item.item_rating?.rating_count?.[1],
                    rating_2: item.item_rating?.rating_count?.[2],
                    rating_3: item.item_rating?.rating_count?.[3],
                    rating_4: item.item_rating?.rating_count?.[4],
                    rating_5: item.item_rating?.rating_count?.[5],
                    shop_name: item.shop_name,
                    shop_location: item.shop_location,
                    shopee_verified: item.shopee_verified,
                    preferred_plus: item.is_preferred_plus_seller,
                    is_service_by_shopee: item.is_service_by_shopee,
                    is_official_shop: item.is_official_shop,
                    voucher: item.voucher_info ? true : false,
                };

                allItems.push(clean);
                console.log(clean);
            }
        });
    }

    console.log(`\n🎉 Total items scraped: ${allItems.length}`);

    // Save as CSV
    // if (allItems.length > 0) {
    //     const parser = new Parser();
    //     const csv = parser.parse(allItems);
    //     fs.writeFileSync("shopee_data.csv", csv);
    //     console.log("✅ Data saved to shopee_data.csv");
    // }
}

scrapeMultiple(1); // total page
