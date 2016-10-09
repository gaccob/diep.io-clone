
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
            local mod_fd = io.open(mod, 'r')
            if not mod_fd then
                mod_fd = io.open(mod .. ".js", 'r')
            end
            if not mod_fd then
                print("mod file[" .. mod .. "] not found")
                return
            end
            local prefix = space or ""
            output_fd:write(prefix .. "require.register(\"" .. mod .. "\", function(module, exports, require) {\n")
            for line in mod_fd:lines() do
                output_fd:write(prefix .. "    " .. line .. "\n")
            end
            output_fd:write(prefix .. "});\n")
            mod_fd:close()
        else
            output_fd:write(line .. "\n")
        end
    end
    output_fd:close()
end

os.execute("find . -name \"*.tmpl\" > ._tmp")
for line in io.lines("._tmp") do
    generate(line)
end
os.execute("rm ._tmp")

