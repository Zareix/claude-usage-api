import tailwind from "bun-plugin-tailwind"

await Bun.build({
  entrypoints: ["./src/index.ts"],
  plugins: [tailwind],
  bytecode: true,
  compile: {
    outfile: "./server",
  },
})
