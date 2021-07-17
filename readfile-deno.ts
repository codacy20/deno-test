import { readCSV, readCSVObjects } from "https://deno.land/x/csv/mod.ts";

const filenames = Deno.args[0];
const environment = Deno.args[1];
// const attribute_name = Deno.args[2];

const f = await Deno.open(filenames);

const Attribute: {
  environment: string;
  opco: string;
  product_type: string;
  attribute_name: string;
  attribute_type: string;
  attribute_constraint: string;
  attribute_is_required: string;
}[] = [];

type attrList = {
  environment: string;
  opco: string;
  // deno-lint-ignore no-explicit-any
  attributes: Map<string, typeof Attribute[0]>;
};

for await (const obj of readCSVObjects(f)) {
  Attribute.push({
    environment: obj.environment,
    opco: obj.opco,
    attribute_constraint: obj.attribute_constraint,
    attribute_is_required: obj.attribute_is_required,
    attribute_name: obj.attribute_name,
    attribute_type: obj.attribute_type,
    product_type: obj.product_type,
  });
}

/*
    this gives you a list of all opcos and their attributes 
*/
let listOfOpco: { [k: string]: attrList } = {
  "": { opco: "", environment: "", attributes: new Map() },
};
for await (const obj of Attribute) {
  const x = obj.opco;
  const attrName = obj.attribute_name;
  // check if the opco has been listed already
  if (listOfOpco[x]) {
    // if the attributes has been listed already
    if (listOfOpco[x].attributes.has(obj.attribute_name)) {
      const newMap = listOfOpco[x].attributes.get(obj.attribute_name);
      //   if (obj.attribute_type !== newMap?.attribute_type)
      //     console.log("not good attribute_name", obj.attribute_name, obj.opco);
      //   if (obj.attribute_constraint !== newMap?.attribute_constraint)
      //     console.log(
      //       "not good attribute_constraint",
      //       obj.attribute_name,
      //       obj.opco
      //     );
      // if the attributes has been been listed already but with a dif attribute_type
      if (obj.attribute_type !== newMap?.attribute_type) {
        console.log(
          "original:",
          newMap?.opco,
          newMap?.environment,
          newMap?.attribute_name,
          newMap?.attribute_type,
          newMap?.product_type
        );
        console.log(
          "vs :",
          obj.opco,
          obj.environment,
          obj.attribute_name,
          obj.attribute_type,
          obj.product_type
        );
      }
    } else {
      // if the attributes has NOT been listed already
      const newMap = listOfOpco[x].attributes;
      newMap.set(attrName, <typeof Attribute[0]>obj);
      listOfOpco[x] = {
        opco: obj.opco,
        environment,
        attributes: newMap,
      };
    }
  } else {
    // if the opco has NOT been listed already
    const newMap = new Map<string, typeof Attribute[0]>();
    newMap.set(attrName, <typeof Attribute[0]>obj);
    listOfOpco[x] = {
      opco: obj.opco,
      environment,
      attributes: newMap,
    };
  }
}

f.close();
