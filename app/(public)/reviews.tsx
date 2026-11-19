"use client"

import Autoplay from "embla-carousel-autoplay"
import { StarIcon } from "lucide-react"

import { reviews } from "@/demodata/review"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <StarIcon
          key={index}
          className={cn(
            "size-4",
            index < count
              ? "fill-primary text-primary"
              : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  )
}

export function Reviews() {
  return (
    <section className="border-t border-border bg-muted/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16 md:px-14 md:py-20">
        <h2 className="font-heading text-2xl font-semibold text-foreground md:text-3xl">
          What people say
        </h2>
        <Carousel
          className="mt-8"
          opts={{ loop: true, align: "start" }}
          plugins={[
            Autoplay({
              delay: 3500,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
        >
          <CarouselContent>
            {reviews.map((item) => (
              <CarouselItem
                key={item.name}
                className="md:basis-1/2 lg:basis-1/3"
              >
                <Card className="h-full">
                  <CardHeader>
                    <Stars count={item.stars} />
                    <CardTitle className="mt-3">{item.name}</CardTitle>
                    <CardDescription>{item.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground">{item.review}</p>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-1 md:-left-12" />
          <CarouselNext className="right-1 md:-right-12" />
        </Carousel>
      </div>
    </section>
  )
}
