import tailwind from "bun-plugin-tailwind";

const result = await Bun.build({
  entrypoints: ["./src/index.ts"],
  plugins: [tailwind],
  bytecode: true,
  compile: {
    outfile: "./server",
  },
});
