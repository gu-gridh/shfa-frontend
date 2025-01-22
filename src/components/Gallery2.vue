<template>
    <masonry-infinite-grid class="container" :gap="5" @request-append="onRequestAppend">
        <div class="item" v-for="(item, i) in items" :key="item.key" :data-grid-groupkey="item.groupKey">
            <div class="thumbnail">
                <img :src="`${item.iiif_file}/full/350,/0/default.jpg`" alt="shfa image" />
            </div>
            <div class="info">
                {{ item.info }}
            </div>
        </div>
    </masonry-infinite-grid>
</template>

<script>
import { MasonryInfiniteGrid } from "@egjs/vue3-infinitegrid";

export default {
    name: "MyInfiniteGrid",
    components: {
        MasonryInfiniteGrid,
    },
    // emits: [
    //     "request-append",
    //     "request-prepend",
    //     "render-complete",
    //     "change-scroll"
    // ],
    data() {
        return {
            items: [],
            nextUrl: "https://diana.dh.gu.se/api/shfa/image/?limit=25",
            currentGroupKey: 0,
            isFetching: false,
        };
    },
    // mounted() {
    //   // this.fetchNextItems();
    // },
    methods: {
        //infscroll load
        async onRequestAppend(e) {
            //if we're already fetching or if there's no next page
            if (this.isFetching || !this.nextUrl) {
                return;
            }
            this.isFetching = true;

            try {
                const res = await fetch(this.nextUrl);
                const data = await res.json();

                const newItems = data.results.map((img, index) => {
                    return {
                        groupKey: this.currentGroupKey,
                        //unique key
                        key: `g${this.currentGroupKey}-${img.id}`,
                        iiif_file: img.iiif_file,
                        info: `id: ${img.id} | year: ${img.year}`,
                    };
                });

                this.currentGroupKey += 1;
                this.items = [...this.items, ...newItems];
                this.nextUrl = data.next;
            } catch (err) {
                console.error(err);
            } finally {
                this.isFetching = false;
            }
        },
    },
};
</script>

<style scoped>
html,
body {
    position: relative;
    margin: 0;
    padding: 0;
    height: 100%;
    background: #fff;
}

a {
    color: unset;
    text-decoration: none;
}

.header {
    text-align: center;
    background: #333;
    color: #fff;
    padding: 20px 0px;
    margin: 0;
    margin-bottom: 10px;
}

.description {
    padding: 6px 30px;
    margin: 0;
    font-weight: 400;
}

.description li {
    padding: 3px 0px;
}

.wrapper {
    margin-top: 50px;
}

.container {
    width: 100%;
    height: 600px;
}

.item {
    display: inline-block;
    width: 250px;
    opacity: 1;
}

.masonrygrid.horizontal .item {
    width: auto;
    height: 250px;
}

.item .info {
    display: flex;
    align-items: center;
    font-weight: bold;
    color: #777;
    height: 30px;
}

.item .thumbnail {
    overflow: hidden;
    border-radius: 8px;
    font-size: 0;
    height: calc(100% - 30px);
}

.item .thumbnail img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: #eee;
    object-fit: contain;
}

.item .thumbnail img {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    background: #eee;
    object-fit: contain;
}

.masonrygrid.horizontal .item .thumbnail img {
    width: auto;
    height: 210px;
}

.item.animate {
    transition: opacity ease 1s;
    transition-delay: 0.2s;
    opacity: 1;
}

.placeholder {
    width: 250px;
    border-radius: 5px;
    background: #eee;
    height: 250px;
}

.loading {
    position: absolute;
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-weight: bold;
}

.button-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    text-align: center;
    height: 50px;
    z-index: 1;
}
</style>