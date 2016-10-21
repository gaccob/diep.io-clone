function generate(input_file)
    if not string.match(input_file, "[.]tmpl$") then
        print("input file[" .. file .. "] does not end with .tmpl")
        return
    end

    local output_file = string.match(input_file, "(.+)[.]tmpl$")
    local output_fd = io.open(output_file, 'w+')

    for line in io.lines(input_file) do
        local space, mod = string.match(line, "(%s*)require.register%(\"(.+)\"%)")
        if mod then
            -- os.execute("../node_modules/uglify-js/bin/uglifyjs " .. mod .. ".js -c -m > " .. mod .. ".min.js");
            -- local mod_fd = io.open(mod .. ".min.js", 'r')
            local mod_fd = io.open(mod .. ".js", 'r')
            if not mod_fd then
                print("mod file[" .. mod .. ".js] not found")
                return
            end
            local prefix = space or ""
            output_fd:write(prefix .. "<script>\n")
            output_fd:write(prefix .. "require.register(\"" .. mod .. "\", function(module, exports, require) {\n")
            for line in mod_fd:lines() do
                output_fd:write(prefix .. "    " .. line .. "\n")
            end
            output_fd:write(prefix .. "});\n")
            output_fd:write(prefix .. "</script>\n")
            mod_fd:close()
            -- os.execute("rm " .. mod .. ".min.js");
        else
            output_fd:write(line .. "\n")
        end
    end
    output_fd:close()
end

os.execute("find . -name \"*.tmpl\" > ._tmp")
for line in io.lines("._tmp") do
    generate(line)
    print("convert [" .. line .. "] success")
end
os.execute("rm ._tmp")

