#!/usr/bin/env python3
"""
Look up a Figma design token by (partial) name in docs/tokens-figma.json.

Usage:
    python3 scripts/figma-token.py "title/title-2/font-size"
    python3 scripts/figma-token.py "title-2"          # broader match
    python3 scripts/figma-token.py "md/semantic/type/text/title/title-2/font-size"

Matching is substring-based against the token's full "collection | mode | name"
path, so partial or loosely-remembered paths (like Figma's dev-mode inspector
strings, which include mode prefixes such as "md/semantic/...") still resolve.
Alias values (isAlias: true) are followed and printed alongside the resolved
concrete value.
"""

import json
import sys
from pathlib import Path

TOKENS_PATH = Path(__file__).resolve().parent.parent / "docs" / "tokens-figma.json"


def load_tokens():
    with open(TOKENS_PATH) as f:
        return json.load(f)


def resolve_alias(data, collection_name, var_name, depth=0):
    """Follow an alias chain to its concrete value."""
    if depth > 10:
        return None
    for c in data["collections"]:
        if c["name"] != collection_name:
            continue
        for m in c["modes"]:
            for v in m["variables"]:
                if v["name"] == var_name:
                    if v.get("isAlias"):
                        alias = v["value"]
                        return resolve_alias(
                            data, alias["collection"], alias["name"], depth + 1
                        )
                    return v["value"]
    return None


def search(data, query):
    query_lower = query.lower()
    results = []
    for c in data["collections"]:
        for m in c["modes"]:
            for v in m["variables"]:
                path = f"{c['name']} | {m['name']} | {v['name']}"
                if query_lower in v["name"].lower() or query_lower in path.lower():
                    results.append((c["name"], m["name"], v))
    return results


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/figma-token.py <token path or partial name>")
        sys.exit(1)

    query = sys.argv[1]
    data = load_tokens()
    results = search(data, query)

    if not results:
        print(f"No token found matching: {query}")
        sys.exit(1)

    for collection_name, mode_name, v in results:
        value = v["value"]
        if v.get("isAlias"):
            resolved = resolve_alias(data, value["collection"], value["name"])
            print(f"{collection_name} | {mode_name} | {v['name']}")
            print(f"  -> alias of {value['collection']} / {value['name']}")
            print(f"  -> resolved value: {resolved}")
        else:
            print(f"{collection_name} | {mode_name} | {v['name']} = {value}")


if __name__ == "__main__":
    main()
