#!/bin/bash

resizeImages() {
    local imgs=("./src/imgs/*")
    local sizes=(320 640 768 1536 1024 2048 1440 2880)
    local dest=./public/assets/imgs

    for img in $imgs
    do
        for size in "${sizes[@]}"
        do
            local original=$img
            local path=$dest/${img##*/}

            echo generating: ${path%.*}_$size.jpg

            convert "$img" -resize "$size"x"$size" -quality 80 ${path%.*}_$size.jpg
        done
    done
}

resizeImages
